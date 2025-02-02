#!/bin/bash

# Exit on any error
set -e

echo "Deploying backend...."

# Configure docker to use minikube's Docker daemon
echo "Configuring Docker to use Minikube's Docker daemon..."
eval $(minikube -p minikube docker-env)

echo "Logging into the docker registry..."

# DOCKER_PASSWORD=Docker@2402
# DOCKER_USERNAME=xsarush0856

# docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD

if [ $? -ne 0 ]; then
    echo "Docker Login failed"
    exit 1
fi

echo "Docker Login success"

IMAGE_TAG="v_$(date +%Y%m%d_%H%M%S)"

cd backend
echo "Building image with tag: ${IMAGE_TAG}"
docker build -t xsarush0856/makemates-backend:${IMAGE_TAG} -f docker/Dockerfile .
docker push xsarush0856/makemates-backend:${IMAGE_TAG}
echo "Backend pushed successfully"

# Delete existing pods to force update
echo "Deleting existing pods..."
kubectl delete pods -n makemates -l app=makemates-backend --grace-period=0 --force || true

# Deploy with new image tag
echo "Deploying new version..."
helm upgrade --install makemates-backend ../helm-charts/backend/ -n makemates \
    --set image.repository="xsarush0856/makemates-backend" \
    --set image.tag="${IMAGE_TAG}" \
    --set image.pullPolicy="Always"

# Wait for new pod to be ready
echo "Waiting for new pod to be ready..."
kubectl wait --for=condition=ready pod -l app=makemates-backend -n makemates --timeout=120s

echo "Deployment successful"