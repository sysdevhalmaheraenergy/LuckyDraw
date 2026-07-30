pipeline {
    agent any

    options {
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
    }

    environment {
        // These are defaults; overridden per branch in 'Set Environment' stage
        HOST = "185.227.135.32"
        USER = "sysdev"
        SSH_PORT = "2212"

        // Firebase Admin (image storage for prizes) — non-secret config
        FIREBASE_PROJECT_ID = "hsm-apps"
        FIREBASE_STORAGE_BUCKET = "hsm-apps.firebasestorage.app"

        // Secrets are injected via withCredentials in the Deploy stage.
        // Required Jenkins credentials (Secret text):
        //   jwt-secret              → JWT_SECRET
        //   auth-secret             → AUTH_SECRET
        //   nextauth-secret         → NEXTAUTH_SECRET
        //   firebase-client-email   → FIREBASE_CLIENT_EMAIL
        //   firebase-private-key    → FIREBASE_PRIVATE_KEY
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Set Environment') {
            steps {
                script {
                    // Detect branch AFTER checkout so GIT_BRANCH is available
                    def branch = env.GIT_BRANCH?.replace('origin/', '') ?: env.BRANCH_NAME ?: 'dev'
                    env.DEPLOY_BRANCH = branch
                    echo "Detected branch: ${branch}"

                    if (branch == 'main') {
                        env.HOST = "147.93.107.249"
                        env.USER = "root"
                        env.SSH_PORT = "6531"
                        env.SSH_CREDENTIAL = "deploy-server-inventory-staging"
                        env.APP_DIR = "/var/www/luckydraw-production"
                        env.APP_NAME = "luckydraw-production"
                        env.PORT = "3039"
                        env.NEXT_PUBLIC_APP_URL = "http://147.93.107.249:3039"
                        env.AUTH_URL = "http://147.93.107.249:3039"
                        env.DATABASE_URL = "postgresql://baronhcisdocportal:955section3259earlyexperienceidea54well@194.233.93.234:6530/lucky_draw_production?schema=public"
                    } else if (branch == 'uat') {
                        env.SSH_CREDENTIAL = "deploy-server-staging"
                        env.APP_DIR = "/var/www/luckydraw-uat"
                        env.APP_NAME = "luckydraw-uat"
                        env.PORT = "3029"
                        env.NEXT_PUBLIC_APP_URL = "http://185.227.135.32:3029"
                        env.AUTH_URL = "http://185.227.135.32:3029"
                        env.DATABASE_URL = "postgresql://baronhcisdocportal:955section3259earlyexperienceidea54well@194.233.93.234:6530/lucky_draw_uat?schema=public"
                    } else {
                        // Default to dev/staging
                        env.SSH_CREDENTIAL = "deploy-server-staging"
                        env.APP_DIR = "/var/www/luckydraw"
                        env.APP_NAME = "luckydraw"
                        env.PORT = "3019"
                        env.NEXT_PUBLIC_APP_URL = "http://185.227.135.32:3019"
                        env.AUTH_URL = "http://185.227.135.32:3019"
                        env.DATABASE_URL = "postgresql://baronhcisdocportal:955section3259earlyexperienceidea54well@194.233.93.234:6530/lucky_draw_staging?schema=public"
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                expression { env.DEPLOY_BRANCH == 'dev' || env.DEPLOY_BRANCH == 'uat' || env.DEPLOY_BRANCH == 'main' }
            }

            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
                        string(credentialsId: 'auth-secret', variable: 'AUTH_SECRET'),
                        string(credentialsId: 'nextauth-secret', variable: 'NEXTAUTH_SECRET'),
                        string(credentialsId: 'firebase-client-email', variable: 'FIREBASE_CLIENT_EMAIL'),
                        string(credentialsId: 'firebase-private-key', variable: 'FIREBASE_PRIVATE_KEY'),
                    ]) {
                        sshagent([env.SSH_CREDENTIAL]) {
                        sh """
                            set -e

                            echo "================================"
                            echo "Deploying to server"
                            echo "Host : ${env.HOST}"
                            echo "Port : ${env.SSH_PORT}"
                            echo "Branch: ${env.DEPLOY_BRANCH}"
                            echo "================================"

                            # Sync source code to server (no rsync needed on agent)
                            echo "Syncing code to server via tar+ssh..."
                            ssh -p ${env.SSH_PORT} -o StrictHostKeyChecking=no ${env.USER}@${env.HOST} "mkdir -p ${env.APP_DIR}"
                            tar --exclude='node_modules' \
                                --exclude='.git' \
                                --exclude='.next' \
                                --exclude='.env' \
                                --exclude='coverage' \
                                --exclude='*.log' \
                                --exclude='Jenkinsfile' \
                                --exclude='deploy.sh' \
                                -czf - . | \
                            ssh -p ${env.SSH_PORT} -o StrictHostKeyChecking=no ${env.USER}@${env.HOST} "tar -xzf - -C ${env.APP_DIR}"

                            # Create .env and manage Docker container on server
                            ssh -p ${env.SSH_PORT} -o StrictHostKeyChecking=no ${env.USER}@${env.HOST} << 'REMOTE_EOF'
set -e

APP_DIR="${env.APP_DIR}"
APP_NAME="${env.APP_NAME}"
PORT="${env.PORT}"
export APP_DIR APP_NAME PORT

echo "Creating .env file with build and runtime configuration..."
cat > ${env.APP_DIR}/.env << EOF
APP_NAME=${env.APP_NAME}
PORT=${env.PORT}
NEXTAUTH_SECRET="${env.NEXTAUTH_SECRET}"
AUTH_SECRET="${env.AUTH_SECRET}"
AUTH_URL="${env.AUTH_URL}"
NEXT_PUBLIC_APP_URL="${env.NEXT_PUBLIC_APP_URL}"
JWT_SECRET="${env.JWT_SECRET}"
FIREBASE_PROJECT_ID=${env.FIREBASE_PROJECT_ID}
FIREBASE_CLIENT_EMAIL="${env.FIREBASE_CLIENT_EMAIL}"
FIREBASE_PRIVATE_KEY="${env.FIREBASE_PRIVATE_KEY}"
FIREBASE_STORAGE_BUCKET=${env.FIREBASE_STORAGE_BUCKET}
DATABASE_URL="${env.DATABASE_URL}"
NODE_ENV=production
HOST=0.0.0.0
EOF

echo "Building and starting Docker container..."
cd ${env.APP_DIR}

# Remove stale container if any (handles name conflict from prior deploy)
docker rm -f ${env.APP_NAME} 2>/dev/null || true
docker compose down --remove-orphans || true
docker compose up -d --build

echo "Checking application..."
sleep 10

# Verify application is responding
HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${env.PORT} || echo "000")

if [ "\$HTTP_CODE" = "200" ] || [ "\$HTTP_CODE" = "304" ] || [ "\$HTTP_CODE" = "000" ]
then
    # 000 means curl couldn't connect yet, give it more time
    if [ "\$HTTP_CODE" = "000" ]; then
        echo "Waiting for application to start..."
        sleep 15
        HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${env.PORT} || echo "000")
    fi
fi

if docker inspect --format='{{.State.Running}}' ${env.APP_NAME} | grep -q "true"
then
    echo "SUCCESS: ${env.APP_NAME} running on port ${env.PORT} (HTTP \$HTTP_CODE)"
else
    echo "ERROR: ${env.APP_NAME} failed to start"
    docker compose logs
    exit 1
fi
REMOTE_EOF
                        """
                    }
                    }
                }
            }
        }
    }

    post {

        success {
            echo "Deployment success"
        }

        failure {
            echo "Deployment failed"
        }
    }
}
