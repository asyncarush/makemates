#! /usr/bin/bash
set -e

echo "Deploying frontend...."

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

# Navigate to frontend directory
cd frontend

# Build the Docker image
echo "Building frontend Docker image..."
docker build -t xsarush0856/makemates-frontend .

# Push the image to Docker Hub
echo "Pushing image to Docker Hub..."
docker push xsarush0856/makemates-frontend

# Go back to root directory for helm deployment
cd ..

# Deploy using Helm
echo "Deploying using Helm..."
helm upgrade --install makemates-frontend ./helm-charts/frontend/ -n makemates \
  --set image.repository="xsarush0856/makemates-frontend" \
  --set image.tag="latest" || echo "Deployment failed"

echo "Frontend deployment completed!"
echo "Frontend pushed successfully"

echo "Deployment successful"
