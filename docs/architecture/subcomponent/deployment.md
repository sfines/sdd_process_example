# Deployment & CI/CD Architecture

This document details the deployment and CI/CD architecture, which is responsible for building, testing, and deploying the application.

## Architectural Decisions

- **[ADR-008: Deployment & CI/CD Strategy](./../adrs/008-deployment-cicd-strategy.md)**

## Technology Stack

| Component            | Technology      | Version | Purpose                         |
| -------------------- | --------------- | ------- | ------------------------------- |
| **Containerization** | Docker          | 24+     | Application packaging           |
| **Orchestration**    | Docker Compose  | 2.23+   | Multi-container management      |
| **CI/CD**            | GitHub Actions  | Latest  | Automated pipeline              |
| **Registry**         | GHCR            | Latest  | Docker image storage            |
| **Web Server**       | Nginx           | 1.25+   | Reverse proxy + SSL termination |
| **SSL**              | Let's Encrypt   | Latest  | HTTPS certificates (Certbot)    |
| **VPS**              | Google CloudRun | -       | Production hosting              |

## Deployment Architecture

### Docker Compose Structure

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    image: ghcr.io/sfines/dnd-dice-roller-backend:latest
    environment:
      - DATABASE_URL=sqlite:////data/permalinks.db
      - VALKEY_URL=redis://valkey:6379
      - SENTRY_DSN=${SENTRY_DSN}
      - ENVIRONMENT=production
    volumes:
      - ./data:/data
    depends_on:
      - valkey
    networks:
      - app-network
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first # Zero-downtime

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    image: ghcr.io/sfines/dnd-dice-roller-frontend:latest
    environment:
      - VITE_API_URL=https://dice.example.com
      - VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
    networks:
      - app-network

  valkey:
    image: valkey/valkey:8.0-alpine
    command: valkey-server --appendonly yes --appendfsync everysec
    volumes:
      - valkey-data:/data
    networks:
      - app-network
    deploy:
      resources:
        limits:
          memory: 512M

  nginx:
    image: nginx:1.25-alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/letsencrypt:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
    depends_on:
      - backend
      - frontend
    networks:
      - app-network

volumes:
  valkey-data:
  data:

networks:
  app-network:
    driver: bridge
```

### Production VPS Setup

**Server Specs (DigitalOcean $20/month):**

- 4 GB RAM
- 2 vCPUs
- 80 GB SSD
- Ubuntu 22.04 LTS

**Installation Script:**

```bash
#!/bin/bash
# setup-vps.sh

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt-get update
apt-get install -y docker-compose-plugin

# Install Certbot
apt-get install -y certbot

# Create app directory
mkdir -p /opt/dnd-dice-roller
cd /opt/dnd-dice-roller

# Clone repo (deploy key)
git clone git@github.com:sfines/dnd-dice-roller.git .

# Generate SSL certificate
certbot certonly --standalone -d dice.example.com --non-interactive --agree-tos -m steve@example.com

# Create .env file
cat > .env <<EOF
SENTRY_DSN=your-sentry-dsn
VITE_SENTRY_DSN=your-frontend-sentry-dsn
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
EOF

# Initial deploy
docker-compose pull
docker-compose up -d

# Setup auto-renewal
echo "0 3 * * * certbot renew --quiet && docker-compose restart nginx" | crontab -
```

### Deployment Workflow

**GitHub Actions Deployment:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to GHCR
        run: echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin

      - name: Build and Push Images
        run: |
          docker-compose build
          docker tag dnd-dice-roller-backend ghcr.io/sfines/dnd-dice-roller-backend:${{ github.sha }}
          docker tag dnd-dice-roller-backend ghcr.io/sfines/dnd-dice-roller-backend:latest
          docker tag dnd-dice-roller-frontend ghcr.io/sfines/dnd-dice-roller-frontend:${{ github.sha }}
          docker tag dnd-dice-roller-frontend ghcr.io/sfines/dnd-dice-roller-frontend:latest
          docker push ghcr.io/sfines/dnd-dice-roller-backend:${{ github.sha }}
          docker push ghcr.io/sfines/dnd-dice-roller-backend:latest
          docker push ghcr.io/sfines/dnd-dice-roller-frontend:${{ github.sha }}
          docker push ghcr.io/sfines/dnd-dice-roller-frontend:latest

      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/dnd-dice-roller
            git pull origin main
            docker-compose pull
            docker-compose up -d
            docker system prune -af

      - name: Health Check
        run: |
          sleep 10
          curl -f https://dice.example.com/api/health || exit 1

      - name: Notify Sentry
        run: |
          curl -X POST https://sentry.io/api/0/organizations/your-org/releases/ \
            -H "Authorization: Bearer ${{ secrets.SENTRY_AUTH_TOKEN }}" \
            -d '{"version": "${{ github.sha }}", "projects": ["dnd-dice-roller"]}'
```
