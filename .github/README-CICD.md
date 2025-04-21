# CI/CD Setup for MakeMates

This document describes how to set up CI/CD for deploying the MakeMates application to Google Cloud.

## Required GitHub Secrets

Add the following secrets to your GitHub repository:

1. `GCR_PROJECT_ID`: Your Google Cloud project ID
2. `GCP_SA_KEY`: Base64-encoded service account key file JSON content
3. `KUBECONFIG`: The complete kubeconfig file content for accessing your custom Kubernetes cluster
4. `KUBE_CONTEXT`: The context name to use from your kubeconfig file

## Setting Up Service Account

1. Create a service account with the following roles:

   - Container Registry Service Agent
   - Storage Admin
   - Compute Viewer (to access VM instances)

2. Create a key for the service account and download the JSON file

3. Convert the JSON file to base64:

   ```bash
   cat your-service-account-key.json | base64
   ```

4. Copy the output and add it as the `GCP_SA_KEY` secret in GitHub

## Setting Up Kubeconfig

1. Make sure you have a working kubeconfig file that can connect to your custom Kubernetes cluster on VM instances

2. Add the entire content of your kubeconfig file as the `KUBECONFIG` secret in GitHub:

   ```bash
   cat ~/.kube/config
   ```

3. Identify which context in your kubeconfig points to your cluster:

   ```bash
   kubectl config get-contexts
   ```

4. Add the context name as the `KUBE_CONTEXT` secret in GitHub

## Workflow Details

The CI/CD workflow performs the following steps:

1. Builds Docker images for both frontend and backend
2. Tags and pushes these images to Google Container Registry
3. Sets up kubectl with your custom cluster's kubeconfig
4. Deploys both services using Helm charts to your Kubernetes cluster
5. Verifies the deployments are successful

The workflow runs automatically on pushes to the main branch, or it can be triggered manually via the GitHub Actions UI.

## Customization

If needed, edit the `.github/workflows/deploy.yml` file to adjust:

- Docker build processes
- Helm chart parameters
- Kubernetes namespace
- Image tags and naming conventions
