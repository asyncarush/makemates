#! /usr/bin/bash
set -e

echo "Deploying frontend...."

# Configure docker to use minikube's Docker daemon
echo "Configuring Docker to use Minikube's Docker daemon..."
eval $(minikube docker-env)

echo "Logging into the docker registry..."

DOCKER_PASSWORD=Docker@2402
DOCKER_USERNAME=xsarush0856

docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "Docker Login failed"
    exit 1
fi  
echo "Docker Login success"

echo "Starting frontend deployment..."

# Generate a timestamp for unique tag
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
IMAGE_TAG="v_${TIMESTAMP}"

# Navigate to frontend directory
cd frontend

# Build the Docker image with timestamp tag
echo "Building frontend Docker image with tag: ${IMAGE_TAG}..."
docker build -t xsarush0856/makemates-frontend:${IMAGE_TAG} .

# Push the image to Docker Hub
echo "Pushing image to Docker Hub..."
docker push xsarush0856/makemates-frontend:${IMAGE_TAG}

# Go back to root directory for helm deployment
cd ..

# Delete existing pods to force update
echo "Deleting existing pods..."
kubectl delete pods -n makemates -l app=makemates-frontend --grace-period=0 --force || true

# Deploy using Helm with new image tag
echo "Deploying using Helm..."
helm upgrade --install makemates-frontend ./helm-charts/frontend/ -n makemates \
  --set image.repository="xsarush0856/makemates-frontend" \
  --set image.tag="${IMAGE_TAG}" \
  --set image.pullPolicy="Always"

# Wait for new pod to be ready
echo "Waiting for new pod to be ready..."
kubectl wait --for=condition=ready pod -l app=makemates-frontend -n makemates --timeout=120s

echo "Frontend deployment completed!"
