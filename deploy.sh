#!/bin/bash

# Deployment script for LuckyDraw
# This script can be run locally or via Jenkins

set -e

# Configuration from environment (set by Jenkinsfile or local .env)
SERVER="${SERVER:-root@147.93.107.249}"
SSH_PORT="${SSH_PORT:-6531}"
APP_DIR="${APP_DIR:-/var/www/luckydraw}"
APP_NAME="${APP_NAME:-luckydraw}"
PORT="${PORT:-3019}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of $APP_NAME...${NC}"
echo -e "${YELLOW}Target: $APP_NAME on $SERVER:$PORT${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run from project root.${NC}"
    exit 1
fi

# Step 1: Build locally
echo -e "${YELLOW}[1/5] Building application...${NC}"
npm run build
echo -e "${GREEN}Build completed successfully!${NC}"

# Step 2: Stop existing process on server
echo -e "${YELLOW}[2/5] Stopping existing process on server...${NC}"
ssh -p $SSH_PORT -o StrictHostKeyChecking=no $SERVER "
    if lsof -ti:$PORT | head -1 > /dev/null 2>&1; then
        echo 'Stopping existing process on port $PORT...'
        kill -9 \$(lsof -ti:$PORT) || true
        sleep 2
    fi
    echo 'No existing process found.'
" || true

# Step 3: Sync files to server
echo -e "${YELLOW}[3/5] Syncing files to server...${NC}"
rsync -avz --delete \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude=".next" \
    --exclude=".env" \
    --exclude="coverage" \
    --exclude="*.log" \
    --exclude="Jenkinsfile" \
    --exclude="deploy.sh" \
    ./ $SERVER:$APP_DIR/

# Step 4: Install dependencies and start
echo -e "${YELLOW}[4/5] Installing dependencies and starting application...${NC}"
ssh -p $SSH_PORT -o StrictHostKeyChecking=no $SERVER "
    cd $APP_DIR

    # Create .env if it doesn't exist
    if [ ! -f .env ]; then
        echo 'Warning: .env not found, creating from template...'
    fi

    # Build and start Docker container
    docker compose down --remove-orphans || true
    docker compose up -d --build

    echo 'Application starting...'
    sleep 10

    # Verify application is running
    if docker inspect --format='{{.State.Running}}' $APP_NAME | grep -q 'true'
    then
        echo 'SUCCESS: $APP_NAME running on port $PORT'
    else
        echo 'ERROR: $APP_NAME failed to start'
        docker compose logs
        exit 1
    fi
"

# Step 5: Verify deployment
echo -e "${YELLOW}[5/5] Verifying deployment...${NC}"
sleep 3
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://147.93.107.249:$PORT || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "304" ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "Application is available at: http://147.93.107.249:$PORT"
else
    echo -e "${RED}Warning: Could not verify application is responding (HTTP $HTTP_CODE)${NC}"
    echo -e "Please check the application manually at: http://147.93.107.249:$PORT"
fi

echo -e "${GREEN}Deployment completed!${NC}"