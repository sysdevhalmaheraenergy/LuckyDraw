# Deployment Guide for LuckyDraw

## Overview
This guide covers deploying the LuckyDraw project to Jenkins with deployment to the staging server at `http://185.227.135.32`.

## Server Architecture

| Environment | Branch | Server | SSH Port | App Port | App URL |
|------------|--------|--------|----------|----------|---------|
| **Staging** | `dev` | 185.227.135.32 (sysdev) | 2212 | 3019 | http://185.227.135.32:3019 |
| **UAT** | `uat` | 185.227.135.32 (sysdev) | 2212 | 3029 | http://185.227.135.32:3029 |
| **Production** | `main` | 147.93.107.249 (root) | 6531 | 3039 | http://147.93.107.249:3039 |

## Prerequisites

### Server Requirements
- **Staging (`dev`/`uat`)**: SSH access to `185.227.135.32` (port 2212), user `sysdev`
- **Production (`main`)**: SSH access to `147.93.107.249` (port 6531), user `root`
- Docker and Docker Compose installed on both servers
- nginx (optional, for reverse proxy)

### Jenkins Requirements
- Jenkins installed at `http://185.227.135.32:8080/`
- Git plugin installed
- SSH Agent plugin installed
- **Two SSH credentials** must be configured:
  - `deploy-server-staging` — for staging/uat (`185.227.135.32`)
  - `deploy-server-inventory-staging` — for production (`147.93.107.249`)

## Configuration

### 1. Jenkins Pipeline Setup

1. Open Jenkins at http://185.227.135.32:8080/
2. Create or configure a job for **LuckyDraw**
3. Configure the pipeline:
   - **Branch Specifier**: Set to `*/dev`, `*/uat`, or `*/main`
   - **Credentials**: Add SSH credential `deploy-server-staging`
     - Kind: "SSH Username with private key"
     - Username: `root`
     - Private Key: Paste your private key from `~/.ssh/id_ed25519`
   - **Build Triggers**:
     - Check "GitHub hook trigger for GITScm polling"
     - Or check "Poll SCM" with `H/5 * * * *`

### SSH Access Setup

The repository URL is: `git@github.com:sysdevhalmaheraenergy/luckydraw.git`

**Run these commands on your LOCAL COMPUTER terminal**:

1. **Check if SSH Key exists**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. **Generate SSH Key** (if not exists):
   ```bash
    ssh-keygen -t ed25519 -C "jenkins@185.227.135.32"
   ```

3. **Copy the SSH Public Key**:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

4. **Add SSH Key to GitHub**:
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste the public key content

5. **Test SSH Connection**:
   ```bash
   ssh -T git@github.com
   ```

6. **Configure Jenkins Credentials**:
    - Go to http://185.227.135.32:8080/credentials/
   - Add SSH credential with your private key

### 2. Environment Variables

| Variable | Dev Value | UAT Value | Prod Value | Description |
|----------|-----------|-----------|------------|-------------|
| NEXT_PUBLIC_APP_URL | http://185.227.135.32:3019 | http://185.227.135.32:3029 | http://147.93.107.249:3039 | Frontend URL |
| AUTH_URL | http://185.227.135.32:3019 | http://185.227.135.32:3029 | http://147.93.107.249:3039 | Auth callback URL |
| JWT_SECRET | (see .env) | (see .env) | (see .env) | JWT signing secret |
| NEXTAUTH_SECRET | (see .env) | (see .env) | (see .env) | NextAuth secret |

### 3. Server Setup

The Jenkins pipeline will automatically:
1. Clone/fetch the target branch to the appropriate `/var/www/luckydraw*` directory
2. Create `.env` file with configuration
3. Build and start Docker container on the correct port

## Manual Deployment

```bash
chmod +x deploy.sh
./deploy.sh
```

## Files

| File | Purpose |
|------|---------|
| `Jenkinsfile` | Jenkins pipeline configuration |
| `Dockerfile` | Multi-stage Docker build |
| `docker-compose.yml` | Container orchestration |
| `deploy.sh` | Manual deployment script |
| `DEPLOYMENT.md` | This file |

## Deployment Flow

```
1. Push code to branch (dev/uat/main)
       ↓
2. Jenkins triggers build
       ↓
3. SSH to appropriate server:
   - dev/uat  → 185.227.135.32:2212 (sysdev)
   - main     → 147.93.107.249:6531 (root)
       ↓
4. rsync source code to server
       ↓
5. Create .env with environment variables
       ↓
6. docker compose up -d --build
       ↓
7. Health check via curl
       ↓
8. Application available on branch port
```

## Troubleshooting

### Check if application is running
```bash
# Staging/UAT
ssh -p 2212 sysdev@185.227.135.32
docker ps | grep luckydraw

# Production
ssh -p 6531 root@147.93.107.249
docker ps | grep luckydraw-production
```

### View Docker logs
```bash
# Staging/UAT
ssh -p 2212 sysdev@185.227.135.32
docker logs luckydraw

# Production
ssh -p 6531 root@147.93.107.249
docker logs luckydraw-production
```

### Restart application
```bash
# Staging
ssh -p 2212 sysdev@185.227.135.32
cd /var/www/luckydraw
docker compose down && docker compose up -d

# Production
ssh -p 6531 root@147.93.107.249
cd /var/www/luckydraw-production
docker compose down && docker compose up -d
```

### Check port availability
```bash
# Staging/UAT
ssh -p 2212 sysdev@185.227.135.32
lsof -ti:3019 || lsof -ti:3029

# Production
ssh -p 6531 root@147.93.107.249
lsof -ti:3039
```

## Security Notes

1. The Jenkinsfile uses SSH key-based authentication
2. JWT_SECRET and NEXTAUTH_SECRET are stored in Jenkinsfile/.env (consider using Jenkins credentials in production)
3. Never commit `.env.local` to version control
4. Firebase private key is stored in Jenkinsfile (consider using Jenkins credentials in production)