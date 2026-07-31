pipeline {
    agent any

    options {
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
    }

    environment {
        // Firebase Admin (image storage for prizes) — non-secret config
        FIREBASE_PROJECT_ID = "hsm-apps"
        FIREBASE_STORAGE_BUCKET = "hsm-apps.firebasestorage.app"
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
                        env.NEXT_PUBLIC_APP_URL = "https://luckydraw.limagroup.co.id"
                        env.AUTH_URL = "https://luckydraw.limagroup.co.id"
                        env.DATABASE_URL = "postgresql://baronhcisdocportal:955section3259earlyexperienceidea54well@194.233.93.234:6530/lucky_draw_production?schema=public"
                    } else if (branch == 'uat') {
                        env.HOST = "185.227.135.32"
                        env.USER = "sysdev"
                        env.SSH_PORT = "2212"
                        env.SSH_CREDENTIAL = "deploy-server-staging"
                        env.APP_DIR = "/var/www/luckydraw-uat"
                        env.APP_NAME = "luckydraw-uat"
                        env.PORT = "3029"
                        env.NEXT_PUBLIC_APP_URL = "https://luckydraw.limagroup.my.id"
                        env.AUTH_URL = "https://luckydraw.limagroup.my.id"
                        env.DATABASE_URL = "postgresql://baronhcisdocportal:955section3259earlyexperienceidea54well@194.233.93.234:6530/lucky_draw_uat?schema=public"
                    } else {
                        // Default to dev/staging
                        env.HOST = "185.227.135.32"
                        env.USER = "sysdev"
                        env.SSH_PORT = "2212"
                        env.SSH_CREDENTIAL = "deploy-server-staging"
                        env.APP_DIR = "/var/www/luckydraw"
                        env.APP_NAME = "luckydraw"
                        env.PORT = "3019"
                        env.NEXT_PUBLIC_APP_URL = "https://luckydraw.limagroup.my.id"
                        env.AUTH_URL = "https://luckydraw.limagroup.my.id"
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

                            # Sync source code to server
                            echo "Syncing code to server via tar..."
                            tar -czf - --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='.env' --exclude='coverage' --exclude='*.log' --exclude='Jenkinsfile' --exclude='deploy.sh' . | \
                            ssh -i ~/.ssh/id_ed25519 -p ${env.SSH_PORT} -o StrictHostKeyChecking=no ${env.USER}@${env.HOST} "mkdir -p ${env.APP_DIR} && tar -xzf - -C ${env.APP_DIR}"

                            # Create .env and manage Docker container on server
                            ssh -i ~/.ssh/id_ed25519 -p ${env.SSH_PORT} -o StrictHostKeyChecking=no ${env.USER}@${env.HOST} << 'REMOTE_EOF'
set -e

APP_DIR="${APP_DIR}"
APP_NAME="${APP_NAME}"
PORT="${PORT}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}"
AUTH_URL="${AUTH_URL}"
DATABASE_URL="${DATABASE_URL}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
AUTH_SECRET="${AUTH_SECRET}"
JWT_SECRET="${JWT_SECRET}"
FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID}"
FIREBASE_CLIENT_EMAIL="${FIREBASE_CLIENT_EMAIL}"
FIREBASE_PRIVATE_KEY="${FIREBASE_PRIVATE_KEY}"
FIREBASE_STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET}"
export APP_DIR APP_NAME PORT NEXT_PUBLIC_APP_URL AUTH_URL DATABASE_URL NEXTAUTH_SECRET AUTH_SECRET JWT_SECRET FIREBASE_PROJECT_ID FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY FIREBASE_STORAGE_BUCKET

echo "Creating .env file with build and runtime configuration..."
cat > \${APP_DIR}/.env << EOF
APP_NAME=${APP_NAME}
PORT=${PORT}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
AUTH_SECRET=${AUTH_SECRET}
AUTH_URL=${AUTH_URL}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
JWT_SECRET=${JWT_SECRET}
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
DATABASE_URL=${DATABASE_URL}
NODE_ENV=production
HOST=0.0.0.0
SEED_ADMIN_EMAIL=admin@luckydraw.local
SEED_ADMIN_PASSWORD=admin123
SEED_SUPERADMIN_EMAIL=
SEED_SUPERADMIN_PASSWORD=
EOF

echo "Building and starting Docker container..."
cd \${APP_DIR}

# Remove stale container if any (handles name conflict from prior deploy)
docker rm -f \${APP_NAME} 2>/dev/null || true
docker compose down --remove-orphans || true
docker compose up -d --build

echo "Checking application..."
sleep 10

if docker inspect --format='{{.State.Running}}' \${APP_NAME} | grep -q "true"
then
    echo "SUCCESS: \${APP_NAME} running on port \${PORT}"
else
    echo "ERROR: \${APP_NAME} failed to start"
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