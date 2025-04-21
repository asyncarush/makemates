#!/bin/bash
set -e

# Configuration
# You should customize these variables
GCR_PROJECT_ID="nodal-triumph-456804-g0"  # Replace with your GCR project ID
IMAGE_NAME="makemates-backend"
IMAGE_TAG="latest"
HELM_CHART_PATH="./helm-charts/backend"
HELM_RELEASE_NAME="makemates-backend"
HELM_NAMESPACE="makemates"  # Change if you use a different namespace

# Print script usage
print_usage() {
  echo "Usage: $0 [OPTIONS]"
  echo "Options:"
  echo "  --project-id=ID    GCR project ID (default: $GCR_PROJECT_ID)"
  echo "  --image-tag=TAG    Docker image tag (default: $IMAGE_TAG)"
  echo "  --namespace=NS     Kubernetes namespace (default: $HELM_NAMESPACE)"
  echo "  --help             Display this help message"
}

# Parse command-line arguments
for arg in "$@"; do
  case $arg in
    --project-id=*)
      GCR_PROJECT_ID="${arg#*=}"
      ;;
    --image-tag=*)
      IMAGE_TAG="${arg#*=}"
      ;;
    --namespace=*)
      HELM_NAMESPACE="${arg#*=}"
      ;;
    --help)
      print_usage
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      print_usage
      exit 1
      ;;
  esac
done

# Check that required tools are installed
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting."; exit 1; }
command -v gcloud >/dev/null 2>&1 || { echo "Google Cloud SDK is required but not installed. Aborting."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed. Aborting."; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "Helm is required but not installed. Aborting."; exit 1; }

# Full image name for GCR
GCR_IMAGE="gcr.io/$GCR_PROJECT_ID/$IMAGE_NAME:$IMAGE_TAG"

echo "=== Starting deployment process ==="
echo "Image: $GCR_IMAGE"
echo "Helm chart: $HELM_CHART_PATH"
echo "Kubernetes namespace: $HELM_NAMESPACE"

# Step 1: Build Docker image
echo "=== Building Docker image ==="
docker build -t $IMAGE_NAME:$IMAGE_TAG ./backend

# Step 2: Tag the image for GCR
echo "=== Tagging image for GCR ==="
docker tag $IMAGE_NAME:$IMAGE_TAG $GCR_IMAGE

# Step 3: Configure Docker to use gcloud credentials for GCR
echo "=== Configuring Docker authentication for GCR ==="
gcloud auth configure-docker gcr.io --quiet

# Step 4: Push the image to GCR
echo "=== Pushing image to GCR ==="
docker push $GCR_IMAGE

# Step 5: Update the Helm chart values with the new image
echo "=== Deploying Helm chart ==="
helm upgrade --install $HELM_RELEASE_NAME $HELM_CHART_PATH \
  --namespace $HELM_NAMESPACE \
  --set image.repository=gcr.io/$GCR_PROJECT_ID/$IMAGE_NAME \
  --set image.tag=$IMAGE_TAG \
  --set image.pullPolicy=Always

# Wait for deployment to complete
echo "=== Waiting for deployment to complete ==="
kubectl rollout status deployment/$HELM_RELEASE_NAME -n $HELM_NAMESPACE

echo "=== Deployment completed successfully ==="
echo "Application should be available according to your ingress configuration" 