# Deployment Guide for LuckyDraw

## Overview
This guide covers deploying the LuckyDraw project via Jenkins CI/CD pipeline.

## Server Architecture

| Environment | Branch | Server | SSH User | SSH Port | App Port | App URL |
|------------|--------|--------|----------|----------|----------|---------|
| **Staging** | `dev` | 185.227.135.32 | sysdev | 2212 | 3019 | http://185.227.135.32:3019 |
| **UAT** | `uat` | 185.227.135.32 | sysdev | 2212 | 3029 | http://185.227.135.32:3029 |
| **Production** | `main` | 147.93.107.249 | root | 6531 | 3039 | http://147.93.107.249:3039 |

## Prerequisites

### Server Requirements
- **Staging (`dev`/`uat`)**: SSH access to `185.227.135.32` (port 2212), user `sysdev`
- **Production (`main`)**: SSH access to `147.93.107.249` (port 6531), user `root`
- Docker and Docker Compose installed on both servers
- SSH key from Jenkins credential `deploy-server-staging` must be authorized on staging server
- SSH key from Jenkins credential `deploy-server-inventory-staging` must be authorized on production server

### Jenkins Requirements

There are **two separate Jenkins instances**:

| Jenkins | URL | Branches | SSH Credential |
|---------|-----|----------|----------------|
| **Staging** | `http://185.227.135.32:8080/` | `dev`, `uat` | `deploy-server-staging` |
| **Production** | (separate Jenkins) | `main` | `deploy-server-inventory-staging` |

Both Jenkins instances require:
- Git plugin installed
- SSH Agent plugin installed
- **SSH credentials** (configured per instance):
  - `deploy-server-staging` — for staging/uat (`185.227.135.32`)
  - `deploy-server-inventory-staging` — for production (`147.93.107.249`)
- **Secret text credentials** (required on BOTH instances for `withCredentials`):
  - `jwt-secret` — JWT signing secret
  - `auth-secret` — NextAuth AUTH_SECRET
  - `nextauth-secret` — NextAuth NEXTAUTH_SECRET
  - `firebase-client-email` — Firebase service account email
  - `firebase-private-key` — Firebase service account private key

### 1. Jenkins Pipeline Setup

1. Open Jenkins at http://185.227.135.32:8080/ (staging) or the production Jenkins URL
2. Create or configure a job for **LuckyDraw**
3. Configure the pipeline:
   - **Branch Specifier**: Set to `*/dev`, `*/uat`, or `*/main`
   - **Credentials**: Add SSH credential (`deploy-server-staging` or `deploy-server-inventory-staging`)
     - Kind: "SSH Username with private key"
     - Username: `sysdev` (staging) or `root` (production)
     - Private Key: Paste your private key from `~/.ssh/id_ed25519`
   - **Build Triggers**:
     - Check "GitHub hook trigger for GITScm polling"
     - Or check "Poll SCM" with `H/5 * * * *`

### SSH Access Setup

The repository URL is: `git@github.com:sysdevhalmaheraenergy/LuckyDraw.git`

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
4. tar source code and pipe via SSH to server
       ↓
5. Create .env with environment variables
       ↓
6. docker compose up -d --build
       ↓
7. Health check via docker inspect
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

1. The Jenkinsfile uses SSH key-based authentication via `sshagent` and `-i ~/.ssh/id_ed25519`
2. Secrets (JWT_SECRET, AUTH_SECRET, NEXTAUTH_SECRET, Firebase credentials) are injected via Jenkins `withCredentials` — they are NOT stored in the Jenkinsfile or `.env` file
3. Never commit `.env.local` to version control
4. Configure all 5 secret credentials on BOTH Jenkins instances (staging and production)
5. The `.dockerignore` file prevents `.env` and other sensitive files from being included in Docker builds