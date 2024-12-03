#! /usr/bin/bash
set -e

echo "Deploying backend...."

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

cd backend
docker build -t xsarush0856/makemates-backend:latest -f ./docker/Dockerfile .
docker push xsarush0856/makemates-backend:latest
echo "Backend pushed successfully"

# Deploy with explicit imagePullPolicy
helm upgrade --install makemates-backend ../helm-charts/backend/ -n makemates \
    --set image.repository="xsarush0856/makemates-backend" \
    --set image.tag="latest" \
    --set image.pullPolicy="Always"

echo "Deployment successful"