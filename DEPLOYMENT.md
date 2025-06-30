# Typesense Dashboard - OKD Deployment Guide

This guide explains how to deploy the Typesense Dashboard to OKD (OpenShift Kubernetes Distribution) using Docker containers.

## Prerequisites

Before deploying, ensure you have the following installed:

- **Docker**: For building the container image
- **OpenShift CLI (oc)**: For deploying to OKD
- **Access to OKD cluster**: With appropriate permissions to deploy applications in the `wordpress-help` namespace
- **Service Account**: The `typesense-sa` service account must exist with appropriate SCC (Security Context Constraints)

## Quick Start

### 1. Build and Deploy (Automated)

The easiest way to deploy is using the provided deployment script:

```bash
# Make the script executable (if not already done)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### 2. Manual Deployment

If you prefer to deploy manually, follow these steps:

#### Step 1: Build Docker Image

```bash
# Build the image
docker build -t typesense-dashboard:latest .

# If using an external registry, tag and push
docker tag typesense-dashboard:latest your-registry.com/typesense-dashboard:latest
docker push your-registry.com/typesense-dashboard:latest
```

#### Step 2: Deploy to OKD

```bash
# Login to your OKD cluster
oc login --token=your-token --server=your-server

# Create namespace (if it doesn't exist)
oc apply -f k8s/namespace.yaml

# Deploy the application
oc apply -f k8s/ -n wordpress-help

# Check deployment status
oc rollout status deployment/typesense-dashboard -n wordpress-help
```

## Configuration

### Environment Variables

The application can be configured using environment variables. Update the `k8s/configmap.yaml` file to add any required configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: typesense-dashboard-config
  namespace: wordpress-help
data:
  TYPESENSE_SERVER_URL: "http://typesense-server:8108"
  APP_NAME: "Typesense Dashboard"
```

### Route Configuration

Update the `k8s/route.yaml` file to set your domain:

```yaml
spec:
  host: typesense-dashboard.apps.your-cluster-domain.com  # Replace with your domain
```

### Resource Limits

The deployment includes resource limits for CPU and memory. Adjust these in `k8s/deployment.yaml` based on your requirements:

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "50m"
  limits:
    memory: "128Mi"
    cpu: "100m"
```

## Architecture

The deployment includes:

- **Namespace**: `wordpress-help` for resource isolation
- **Service Account**: `typesense-sa` with appropriate SCC permissions
- **Deployment**: 2 replicas with health checks and security context
- **Service**: Internal cluster IP for load balancing
- **Route**: External HTTPS access with TLS termination
- **HPA**: Automatic scaling based on CPU and memory usage
- **ConfigMap**: Environment configuration

## Security Features

The deployment includes several security enhancements:

- **Non-root user**: Container runs as user 1001
- **Read-only filesystem**: Prevents runtime modifications
- **Dropped capabilities**: Removes unnecessary Linux capabilities
- **Security headers**: Added via nginx configuration
- **TLS termination**: HTTPS with automatic HTTP to HTTPS redirect
- **Service Account**: Uses `typesense-sa` with appropriate SCC

## Monitoring and Scaling

### Health Checks

The application includes:
- **Liveness probe**: Checks if the application is running
- **Readiness probe**: Checks if the application is ready to serve traffic
- **Health endpoint**: Available at `/health`

### Auto-scaling

The HorizontalPodAutoscaler (HPA) automatically scales the application:
- **Minimum replicas**: 2
- **Maximum replicas**: 10
- **CPU threshold**: 70%
- **Memory threshold**: 80%

### Monitoring

To monitor the application:

```bash
# Check pod status
oc get pods -n wordpress-help

# Check deployment status
oc get deployment typesense-dashboard -n wordpress-help

# View logs
oc logs -f deployment/typesense-dashboard -n wordpress-help

# Check resource usage
oc top pods -n wordpress-help
```

## Troubleshooting

### Common Issues

1. **Image pull errors**: Ensure the image is available in your registry
2. **Route not accessible**: Check if the domain is correctly configured
3. **Health check failures**: Verify the application is responding on port 8080
4. **Resource constraints**: Adjust resource limits if pods are being evicted
5. **SCC issues**: Ensure `typesense-sa` has the required Security Context Constraints

### Debugging Commands

```bash
# Describe deployment for detailed status
oc describe deployment typesense-dashboard -n wordpress-help

# Check events in namespace
oc get events -n wordpress-help --sort-by='.lastTimestamp'

# Access application directly (port-forward)
oc port-forward svc/typesense-dashboard-service 8080:80 -n wordpress-help

# Check service account permissions
oc get serviceaccount typesense-sa -n wordpress-help -o yaml
```

## Updating the Application

To update the application:

1. Build a new Docker image with a new tag
2. Update the image reference in `k8s/deployment.yaml`
3. Apply the updated deployment:

```bash
oc apply -f k8s/deployment.yaml -n wordpress-help
oc rollout status deployment/typesense-dashboard -n wordpress-help
```

## Cleanup

To remove the deployment:

```bash
# Delete all resources
oc delete -f k8s/ -n wordpress-help

# Note: The namespace will not be deleted as it may be used by other applications
```

## Support

For issues or questions:
1. Check the application logs
2. Review the troubleshooting section
3. Ensure all prerequisites are met
4. Verify OKD cluster connectivity and permissions
5. Confirm `typesense-sa` service account has appropriate SCC

## CI/CD: Automatic Docker Image Build & Push to GHCR

This project uses GitHub Actions to automatically build and push a Docker image to GitHub Container Registry (GHCR) on every release.

### How it works
- On every GitHub release (published or edited), the workflow in `.github/workflows/build-push.yaml` will:
  1. Build the Docker image from the repository.
  2. Tag the image as both the release version and `latest`.
  3. Push the image to `ghcr.io/<your-username-or-org>/<repo-name>:<tag>`.

### Using the image in Kubernetes/OKD
- The `k8s/deployment.yaml` is configured to pull the image from GHCR:
  ```yaml
  image: ghcr.io/amartya.g/typesense-dashboard:latest
  ```
  - You can use a specific release tag instead of `latest` for reproducible deployments.
- Make sure your OKD/Kubernetes cluster can pull from GHCR. For private repositories, create a Kubernetes secret with your GitHub PAT and reference it in your deployment.

### Example: Using a specific release tag
```yaml
image: ghcr.io/amartya.g/typesense-dashboard:v1.2.3
```

For more details, see the workflow file at `.github/workflows/build-push.yaml`. 