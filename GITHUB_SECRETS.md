# GitHub Secrets Configuration for OKD Deployment

This document explains the GitHub secrets required for the automated deployment workflow to OKD/OpenShift.

## Required Secrets

### 1. `OC_TOKEN`
**Description**: OpenShift authentication token for API access  
**Type**: Secret  
**How to get it**:
```bash
# Login to your OpenShift cluster
oc login --token=your-token --server=your-server

# Get your current token
oc whoami --show-token
```

**Usage**: Used by the workflow to authenticate with OpenShift and deploy resources.

### 2. `OC_SERVER`
**Description**: OpenShift cluster server URL  
**Type**: Secret  
**Format**: `https://api.your-cluster-domain.com:6443` or `https://your-cluster-domain.com:6443`

**How to get it**:
```bash
# After logging in, get the server URL
oc config view --minify -o jsonpath='{.clusters[0].cluster.server}'
```

**Usage**: Used by the workflow to connect to the correct OpenShift cluster.

## Optional Secrets

### 3. `GITHUB_TOKEN`
**Description**: GitHub token for package registry access  
**Type**: Secret (automatically provided by GitHub Actions)  
**Note**: This is automatically available in GitHub Actions workflows, no manual setup required.

## Setting Up Secrets

### Step 1: Get OpenShift Credentials
```bash
# Login to your OpenShift cluster
oc login --token=your-token --server=your-server

# Get the token
oc whoami --show-token

# Get the server URL
oc config view --minify -o jsonpath='{.clusters[0].cluster.server}'
```

### Step 2: Add Secrets to GitHub Repository
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - **Name**: `OC_TOKEN`
   - **Value**: Your OpenShift token
   
   - **Name**: `OC_SERVER`
   - **Value**: Your OpenShift server URL

### Step 3: Verify Permissions
Ensure your OpenShift token has the following permissions in the `wordpress-help` namespace:
- `get`, `list`, `watch`, `create`, `update`, `patch`, `delete` on deployments
- `get`, `list`, `watch`, `create`, `update`, `patch`, `delete` on services
- `get`, `list`, `watch`, `create`, `update`, `patch`, `delete` on routes
- `get`, `list`, `watch`, `create`, `update`, `patch`, `delete` on configmaps
- `get`, `list`, `watch`, `create`, `update`, `patch`, `delete` on secrets
- `get`, `list`, `watch`, `create`, `update`, `patch`, `delete` on horizontalpodautoscalers

## Workflow Behavior

### On Release Creation/Edit
- Builds Docker image
- Pushes to GitHub Container Registry (GHCR)
- **Does NOT deploy** (only builds and pushes)

### On Release Publication
- Builds Docker image
- Pushes to GitHub Container Registry (GHCR)
- **Deploys to OKD** using the new image
- Runs health checks
- Reports deployment status

## Security Considerations

1. **Token Expiration**: OpenShift tokens may expire. Monitor and rotate as needed.
2. **Least Privilege**: Use tokens with minimal required permissions.
3. **Secret Rotation**: Regularly rotate your OpenShift tokens.
4. **Audit Logs**: Monitor OpenShift audit logs for deployment activities.

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify `OC_TOKEN` and `OC_SERVER` are correct
   - Check if the token has expired
   - Ensure the token has sufficient permissions

2. **Deployment Fails**
   - Check if the `wordpress-help` namespace exists
   - Verify the `typesense-sa` service account exists
   - Check SCC (Security Context Constraints) permissions

3. **Image Pull Fails**
   - Verify the GitHub Container Registry secret is created
   - Check if the image exists in GHCR
   - Ensure the image path is correct

### Debug Commands
```bash
# Check workflow logs in GitHub Actions
# Check OpenShift events
oc get events -n wordpress-help --sort-by='.lastTimestamp'

# Check pod status
oc get pods -n wordpress-help -l app=typesense-dashboard

# Check deployment status
oc describe deployment typesense-dashboard -n wordpress-help
```

## Example Workflow Run

When a release is published, the workflow will:

1. ✅ Build Docker image
2. ✅ Push to GHCR with tags: `latest` and release version
3. ✅ Login to OpenShift
4. ✅ Create/update GitHub registry secret
5. ✅ Update deployment with new image
6. ✅ Apply all Kubernetes manifests
7. ✅ Wait for deployment rollout
8. ✅ Run health checks
9. ✅ Report deployment status

The application will be available at the route URL once deployment is complete. 