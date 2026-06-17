# 🚀 One-Click ML Pipeline: Complete Beginner-Friendly Deployment Guide

### (EC2 → Docker → Nginx → GitHub Actions CI/CD)

This guide assumes:

* ✅ Your project is already working locally.
* ✅ You have a Dockerfile.
* ✅ You have a DockerHub account.
* ✅ You want automatic deployment to EC2 whenever you push to GitHub.

---

# PHASE 1: Launch EC2 Instance

## Step 1: Create EC2 Instance

AWS Console → EC2 → Launch Instance

Settings:

* Name: `ml-pipeline`
* AMI: Ubuntu Server 22.04 LTS
* Instance Type: `t3.medium`
* Storage: `30 GB`
* Key Pair:

  * Create new
  * Download `.pem` file
  * Save safely

---

## Step 2: Configure Security Group

Allow these inbound rules:

| Type  | Port | Source   |
| ----- | ---- | -------- |
| SSH   | 22   | My IP    |
| HTTP  | 80   | Anywhere |
| HTTPS | 443  | Anywhere |

Launch instance.

---

## Step 3: Connect to EC2

PowerShell:

```powershell
ssh -i "C:\Users\YOUR_NAME\Downloads\your-key.pem" ubuntu@EC2_PUBLIC_IP
```

Example:

```powershell
ssh -i "C:\Users\Maitry\Downloads\aws.pem" ubuntu@13.xxx.xxx.xxx
```

---

# PHASE 2: Prepare EC2

Update system:

```bash
sudo apt update
sudo apt upgrade -y
```

Install utilities:

```bash
sudo apt install git curl unzip -y
```

---

# PHASE 3: Install Docker

Install Docker:

```bash
curl -fsSL https://get.docker.com | sudo sh
```

Add ubuntu user to docker group:

```bash
sudo usermod -aG docker ubuntu
```

Reconnect:

```bash
exit
```

SSH again.

Verify:

```bash
docker --version
```

---

# PHASE 4: Install Docker Compose

Check:

```bash
docker compose version
```

If missing:

```bash
sudo apt install docker-compose-plugin -y
```

Verify:

```bash
docker compose version
```

---

# PHASE 5: Create Deployment Folder

```bash
mkdir ~/ml-pipeline
cd ~/ml-pipeline
```

---

# PHASE 6: Create docker-compose.yml

Create:

```bash
nano docker-compose.yml
```

Paste:

```yaml
services:
  backend:
    image: maitry2212/one-click-ml-pipeline:latest
    container_name: ml_backend
    restart: unless-stopped
    ports:
      - "8000:8000"
```

Save.

---

# PHASE 7: First Deployment

Pull image:

```bash
docker compose pull
```

Start app:

```bash
docker compose up -d
```

Check:

```bash
docker ps
```

Test:

```bash
curl http://localhost:8000
```

Open:

```
http://EC2_PUBLIC_IP:8000
```

Your application should work.

---

# PHASE 8: Install Nginx

Install:

```bash
sudo apt install nginx -y
```

Enable:

```bash
sudo systemctl enable nginx
```

Start:

```bash
sudo systemctl start nginx
```

---

# PHASE 9: Configure Nginx

Create config:

```bash
sudo nano /etc/nginx/sites-available/ml-pipeline
```

Paste:

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:8000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/ml-pipeline \
/etc/nginx/sites-enabled/
```

Remove default:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Test:

```bash
sudo nginx -t
```

Restart:

```bash
sudo systemctl restart nginx
```

Now access:

```
http://EC2_PUBLIC_IP
```

---

# PHASE 10: Push Code to GitHub

Ensure project contains:

```
Dockerfile
requirements.txt
.github/workflows/
```

Commit:

```bash
git add .
git commit -m "Setup CI/CD"
git push origin main
```

---

# PHASE 11: Create DockerHub Access Token

DockerHub:

Account Settings → Security

Create Access Token.

Save:

* Username
* Token

---

# PHASE 12: Add GitHub Secrets

GitHub:

Settings → Secrets and Variables → Actions

Add:

## Docker

```
DOCKER_USERNAME
```

Value:

```
maitry2212
```

---

```
DOCKER_PASSWORD
```

Value:

```
DockerHub Access Token
```

---

## EC2

```
EC2_HOST
```

Value:

```
EC2 Public IP
```

---

```
EC2_SSH_KEY
```

Value:

Entire contents of:

your-key.pem

Example:

-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----

---

# PHASE 13: Create CI/CD Workflow

Create:

```
.github/workflows/ci-cd.yml
```

Paste:

```yaml
name: 🚀 CI/CD Pipeline

on:
  push:
    branches:
      - main

env:
  IMAGE_NAME: maitry2212/one-click-ml-pipeline

jobs:

  validate:
    name: 🧪 Validate Application
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.10"
          cache: "pip"

      - run: pip install -r requirements.txt

      - run: |
          python -c "from app.main import app"
          echo "Validation Successful"

  docker:
    name: 🐳 Build & Push Docker Image
    runs-on: ubuntu-latest
    needs: validate

    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - run: |
          docker build -t $IMAGE_NAME:latest .
          docker push $IMAGE_NAME:latest

  deploy:
    name: 🚀 Deploy to EC2
    runs-on: ubuntu-latest
    needs: docker

    steps:
      - uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/ml-pipeline

            docker compose pull
            docker compose up -d

            docker image prune -af

            echo "Deployment Successful"
```

---

# PHASE 14: Trigger Deployment

Push code:

```bash
git add .
git commit -m "Deploy"
git push origin main
```

GitHub Actions will automatically:

```
🧪 Validate
↓
🐳 Build Docker Image
↓
📤 Push to DockerHub
↓
🚀 SSH into EC2
↓
📥 Pull latest image
↓
🔄 Restart container
↓
✅ Live
```

---

# Future Deployments

Every time you update your code:

```bash
git add .
git commit -m "Update"
git push origin main
```

Everything else happens automatically.

No manual SSH.
No manual docker pull.
No manual restart.

---

# Final Architecture

```text
Developer
   ↓ git push
GitHub Actions
   ↓
🧪 Validate
   ↓
🐳 Docker Build
   ↓
📤 DockerHub
   ↓
🚀 EC2 Deploy
   ↓
Docker Compose
   ↓
FastAPI Container
   ↓
Nginx Reverse Proxy
   ↓
Users
```

# Congratulations 🎉

You now have a professional deployment setup with:

✅ AWS EC2

✅ Docker

✅ Docker Compose

✅ Nginx Reverse Proxy

✅ DockerHub

✅ GitHub Actions

✅ Automatic CI/CD

with only one command for future releases:

```bash
git push origin main
```
