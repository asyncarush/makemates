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


cd frontend
docker build -t xsarush0856/makemates-frontend -f ./frontend/Dockerfile . || echo "Docker Build failed"
docker push xsarush0856/makemates-frontend || echo "Docker Push failed"
echo "Frontend pushed successfully"

kubectl set image deployment/makemates-frontend frontend=xsarush0856/makemates-frontend -n makemates || echo "Deployment failed"
echo "Deployment successful"

