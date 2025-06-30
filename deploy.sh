#!/bin/bash

# Typesense Dashboard Deployment Script
# This script builds the Docker image and deploys to OKD

set -e

# Configuration
IMAGE_NAME="typesense-dashboard"
IMAGE_TAG="latest"
REGISTRY_URL="your-registry-url.com"  # Replace with your registry URL
NAMESPACE="typesense-dashboard"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists oc; then
        print_error "OpenShift CLI (oc) is not installed. Please install it first."
        exit 1
    fi
    
    print_status "Prerequisites check passed!"
}

# Build Docker image
build_image() {
    print_status "Building Docker image..."
    
    # Build the image
    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
    
    if [ $? -eq 0 ]; then
        print_status "Docker image built successfully!"
    else
        print_error "Failed to build Docker image!"
        exit 1
    fi
}

# Tag and push image to registry
push_image() {
    if [ -z "$REGISTRY_URL" ] || [ "$REGISTRY_URL" = "your-registry-url.com" ]; then
        print_warning "Registry URL not configured. Skipping image push."
        print_warning "Please update REGISTRY_URL in this script or use a local image."
        return
    fi
    
    print_status "Tagging and pushing image to registry..."
    
    # Tag the image
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}
    
    # Push the image
    docker push ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}
    
    if [ $? -eq 0 ]; then
        print_status "Image pushed successfully!"
    else
        print_error "Failed to push image!"
        exit 1
    fi
}

# Deploy to OKD
deploy_to_okd() {
    print_status "Deploying to OKD..."
    
    # Check if logged in to OpenShift
    if ! oc whoami >/dev/null 2>&1; then
        print_error "Not logged in to OpenShift. Please run 'oc login' first."
        exit 1
    fi
    
    # Create namespace if it doesn't exist
    if ! oc get namespace ${NAMESPACE} >/dev/null 2>&1; then
        print_status "Creating namespace ${NAMESPACE}..."
        oc apply -f k8s/namespace.yaml
    fi
    
    # Update image reference in deployment if using external registry
    if [ ! -z "$REGISTRY_URL" ] && [ "$REGISTRY_URL" != "your-registry-url.com" ]; then
        print_status "Updating deployment with external registry image..."
        sed -i.bak "s|image: ${IMAGE_NAME}:${IMAGE_TAG}|image: ${REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}|g" k8s/deployment.yaml
    fi
    
    # Apply Kubernetes manifests
    print_status "Applying Kubernetes manifests..."
    oc apply -f k8s/ -n ${NAMESPACE}
    
    # Wait for deployment to be ready
    print_status "Waiting for deployment to be ready..."
    oc rollout status deployment/typesense-dashboard -n ${NAMESPACE} --timeout=300s
    
    if [ $? -eq 0 ]; then
        print_status "Deployment successful!"
        
        # Get route URL
        ROUTE_URL=$(oc get route typesense-dashboard-route -n ${NAMESPACE} -o jsonpath='{.spec.host}')
        if [ ! -z "$ROUTE_URL" ]; then
            print_status "Application is available at: https://${ROUTE_URL}"
        fi
    else
        print_error "Deployment failed!"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    if [ -f k8s/deployment.yaml.bak ]; then
        mv k8s/deployment.yaml.bak k8s/deployment.yaml
    fi
}

# Main execution
main() {
    print_status "Starting Typesense Dashboard deployment..."
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Execute deployment steps
    check_prerequisites
    build_image
    push_image
    deploy_to_okd
    
    print_status "Deployment completed successfully!"
}

# Run main function
main "$@" 