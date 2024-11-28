#! /usr/bin/bash
set -e

echo "Deploying backend...."

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
docker build -t xsarush0856/makemates-backend -f ./docker/Dockerfile . || echo "Docker Build failed"
docker push xsarush0856/makemates-backend || echo "Docker Push failed"
echo "Backend pushed successfully"

kubectl set image deployment/makemates-backend backend=xsarush0856/makemates-backend -n makemates || echo "Deployment failed"
echo "Deployment successful"