#!/bin/bash
# SGI Kubernetes Deployment Script
set -euo pipefail

NAMESPACE="sgi"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== SGSI ISO 27001 - Kubernetes Deployment ==="
echo ""

# Check prerequisites
command -v kubectl >/dev/null 2>&1 || { echo "Error: kubectl not found"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "Error: docker not found"; exit 1; }

# Build images
echo "[1/4] Building Docker images..."
docker build -t sgi-backend:latest "${K8S_DIR}/../sgi-backend-fastapi"
docker build -t sgi-nginx:latest "${K8S_DIR}/../sgi-frontend-angular"
echo "  Done."

# Apply manifests
echo "[2/4] Applying Kubernetes manifests..."
kubectl apply -f "${K8S_DIR}/manifests/namespace.yaml"
kubectl apply -f "${K8S_DIR}/manifests/secrets-config.yaml"
kubectl apply -f "${K8S_DIR}/manifests/mongodb.yaml"
kubectl apply -f "${K8S_DIR}/manifests/postgresql.yaml"
kubectl apply -f "${K8S_DIR}/manifests/redis.yaml"
kubectl apply -f "${K8S_DIR}/manifests/fastapi.yaml"
kubectl apply -f "${K8S_DIR}/manifests/nginx.yaml"
kubectl apply -f "${K8S_DIR}/manifests/ollama.yaml"
kubectl apply -f "${K8S_DIR}/manifests/ingress.yaml"
echo "  Done."

# Wait for rollouts
echo "[3/4] Waiting for deployments..."
kubectl rollout status deployment/sgi-fastapi -n "$NAMESPACE" --timeout=300s || true
kubectl rollout status deployment/sgi-django -n "$NAMESPACE" --timeout=300s || true
kubectl rollout status deployment/sgi-nginx -n "$NAMESPACE" --timeout=300s || true
echo "  Done."

# Status
echo "[4/4] Deployment status:"
kubectl get pods -n "$NAMESPACE"
echo ""
kubectl get svc -n "$NAMESPACE"
echo ""
echo "=== Deployment complete ==="
echo "Access: http://$(kubectl get svc sgi-nginx -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo '<pending>')"
