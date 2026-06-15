#!/bin/bash
# =============================================================================
# deploy.sh — Production Deployment Script
# ONE-CLICK ML PIPELINE
# =============================================================================
# Run this script ON THE EC2 SERVER for manual deploys or first-time setup.
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh [image_tag]
#   ./deploy.sh sha-abc1234   # deploy specific version
#   ./deploy.sh               # deploy :latest
# =============================================================================

set -euo pipefail

# ── Config ───────────────────────────────────────────────────────────────────
IMAGE_NAME="maitry2212/one-click-ml-pipeline"
IMAGE_TAG="${1:-latest}"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.yml"

echo "============================================================"
echo "  ONE-CLICK ML PIPELINE — DEPLOYMENT SCRIPT"
echo "  Date: $(date)"
echo "  Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "============================================================"

# ── Pre-flight checks ────────────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ ERROR: $ENV_FILE not found. Copy .env.example and fill in values."
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ ERROR: $COMPOSE_FILE not found. Ensure you're in the right directory."
  exit 1
fi

# ── Pull latest image ────────────────────────────────────────────────────────
echo ""
echo "📥 [1/5] Pulling Docker image ${IMAGE_NAME}:${IMAGE_TAG}..."
docker pull "${IMAGE_NAME}:${IMAGE_TAG}"
docker pull "${IMAGE_NAME}:latest"

# ── Update IMAGE_TAG in env file ─────────────────────────────────────────────
echo ""
echo "⚙️  [2/5] Setting IMAGE_TAG=${IMAGE_TAG}..."
export IMAGE_TAG

# ── Rolling restart of backend (zero downtime) ───────────────────────────────
echo ""
echo "♻️  [3/5] Restarting backend container..."
docker compose --env-file "$ENV_FILE" up -d --no-deps --force-recreate backend

# ── Health check ─────────────────────────────────────────────────────────────
echo ""
echo "🏥 [4/5] Waiting for backend health check..."
MAX_ATTEMPTS=12
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  if docker compose --env-file "$ENV_FILE" exec -T backend \
    curl -sf http://localhost:8000/ > /dev/null 2>&1; then
    echo "  ✅ Backend is healthy (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    break
  fi
  echo "  ⏳ Not ready yet (attempt $ATTEMPT/$MAX_ATTEMPTS) — waiting 5s..."
  sleep 5

  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo ""
    echo "❌ DEPLOY FAILED: Backend did not become healthy after $((MAX_ATTEMPTS * 5))s"
    echo "   Check logs: docker compose logs backend"
    exit 1
  fi
done

# ── Reload nginx ─────────────────────────────────────────────────────────────
echo ""
echo "🔄 [5/5] Reloading nginx..."
docker compose --env-file "$ENV_FILE" exec -T nginx nginx -s reload

# ── Cleanup ──────────────────────────────────────────────────────────────────
echo ""
echo "🧹 Cleaning up dangling Docker images..."
docker image prune -f

# ── Final status ─────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "  Image: ${IMAGE_NAME}:${IMAGE_TAG}"
echo "  Date:  $(date)"
echo "============================================================"
echo ""
echo "Running containers:"
docker compose --env-file "$ENV_FILE" ps
