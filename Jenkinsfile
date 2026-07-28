pipeline {
    agent any

    options {
        timeout(time: 15, unit: 'MINUTES')
        timestamps()
    }

    environment {
        HOST = "147.93.107.249"
        USER = "root"
        SSH_PORT = "6531"

        // JWT secret for production (use Jenkins credentials in real setup)
        JWT_SECRET = "lJQO5zxqizyegvsO+6rqS6zJ2bq4Hb6s36beV5f5COk="
        NEXTAUTH_SECRET = "dev-only-secret-change-me"

        // Firebase Admin (image storage for prizes)
        FIREBASE_PROJECT_ID = "hsm-apps"
        FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-fbsvc@hsm-apps.iam.gserviceaccount.com"
        FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC41sXzf8for0+p\nanflF9i3Z3Yo8008YeoHNCpaMKPmfLO5Xkqq2MMWbx6FUIDdXeA6Ap/8JS7h2/oU\n0q5+GTEIoL0S64YYN3DreIdzahXpXWE2OciiFbFpTvqPPYuK+uD1Smo5l6nuHDtz\nu9C1IsNgk0kODv32nwETf48PHse7EOASc9HctaYuwVJdXAXY7vd10I5qbiPA9M1I\nTlGH3bxKSvy3wqIyIhVkMJ1zVtW80frW267I9SelnwqBCbU2PfwVCMCcbqYKqJyj\nrWAszSFhJ/CAPsXT2inni5imSyW3Xoj3tfCHDwPH4PVM1xDe3wWgo148bPr50HZx\nHmu8uTSPAgMBAAECggEACYy/KXd+opz8JqqjiyiSP9eOmUsIwIfmiXy+e25r6Wqj\n9n3SqcUNP0l6cDTak5VYEmc0UNiy9WRiJVVFQqqWh/WWDzYv9WxX3zKY/POMMkRq\n01xk60rnoaM8+s2ZOhMAMGwp1NPrKaw3viEEBXfIVGMHsTxBDs7kRVef0o4qj5WW\n/gj3M2/v6mLm4Q025uzBodXu5gjKyHcq68rnbYkg7KtlLZyY07SGDLsLYvCEWpy9\n6gU4dP6O97mBQaDnYMg4LOLgcYO3GEm/vWzhXCwNkp0I0emYJmL3CXXBVb74CRTT\n6vYH4wz3plPq5Nk7LwFVU4/P6X052JRJF1xIbERI8QKBgQDz6wf6PEIooo2CgJ13\njS366gsHXndKzQm8kQXsu+bnh9VvlCaZMufbW2FrEpzJ4p6EADzVFma3Z3NPx17S\n1LEMdFI/yV6CiAldHBzwnRd5Qvgf4tMaIwafCpf0aR9fw9JWwZ+wXHYhzXK+mHIn\n9WGdwRRlEjvQf+/CXi9qsqnKHQKBgQDB/pj1/VwaBsXJNmfDqa5/JbyzqAmJK2qV\nGqQ82ATb4bxUW+CAINhpa3ejB/knlvsF04KwZpJfb+Iqr9OimARR+4LW/C4vAIRU\nnDuyxUhZvYRidjnEMDZ6WVaf5DxsR448z99MB8ENRyCM1kGGJ0vIlJ9+vKEcuwoo\n/JoKOLsZmwKBgBguR6cuDBz9KGw0lefBLjq+swMzAT6AHyP7eIvkgNqZI7ahCEaN\nvmCHqZu0x6hX+AD8CQvS4bHy5oKVMDhUb4zdhz3dl6n3FH6Ph+rul+IkmnaGxQjF\nSiXAJhpLxZl3z0Vcgpk4QVnOhT6R3FdLwzahaoUujpF37WvmbGr2dVCdAoGBAK1M\n9fR6u7Z8amBP++5tPPdVDPgpmysw3+wHesTn7Z9IT2fFFA8iSHIUkTHRQ6E8XU9d\nHhjb6NLdLlwX6qYLy4A5gS7w5YkTmyPC1gnj97hDd2pGV2CN+XzfJmV8DQZl/gkR\nYleXbbyg19E47hwcKrUrIDil5f+2j2MCFdIfz/UVAoGBANO7m3+scDL64T0+HWnH\nGVV70GnkvCa3owQRsrcMDStvR4HGcyS+gBBwGfLiD/t9n666gyHnaoir5OEP0lN+\nimrgfiBYFleR4xHVN0XP5jNUHJMqfPhmxgOQET7LDEaAj8giLExz2ytRK2ER3pk3\nY2ugFzZ6Ao3AJrubZ3ya6U1t\n-----END PRIVATE KEY-----\n'
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
                        env.APP_DIR = "/var/www/luckydraw-production"
                        env.APP_NAME = "luckydraw-production"
                        env.PORT = "3039"
                        env.NEXT_PUBLIC_APP_URL = "http://147.93.107.249:3039"
                        env.DATABASE_URL = "postgresql://baronhcisdocportal:955section3259earlyexperienceidea54well@194.233.93.234:6530/lucky_draw_production?schema=public"
                    } else if (branch == 'uat') {
                        env.APP_DIR = "/var/www/luckydraw-uat"
                        env.APP_NAME = "luckydraw-uat"
                        env.PORT = "3029"
                        env.NEXT_PUBLIC_APP_URL = "http://147.93.107.249:3029"
                        env.DATABASE_URL = "postgresql://baronhcisdocportal:955section3259earlyexperienceidea54well@194.233.93.234:6530/lucky_draw_uat?schema=public"
                    } else {
                        // Default to dev/staging
                        env.APP_DIR = "/var/www/luckydraw"
                        env.APP_NAME = "luckydraw"
                        env.PORT = "3019"
                        env.NEXT_PUBLIC_APP_URL = "http://147.93.107.249:3019"

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
                sshagent(['deploy-server-inventory-staging']) {
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

    post {

        success {
            echo "Deployment success"
        }

        failure {
            echo "Deployment failed"
        }
    }
}
