# 🚀 Azure CI/CD Deployment Guide with GitHub Actions

Complete step-by-step guide for deploying the ABS Rules Red Text Extractor to Azure using GitHub Actions for CI/CD automation.

## 🎯 **Key Point: One-Time Setup vs. Ongoing Deployments**

**  ✅ Initial Setup (ONE TIME):**
- Azure resources setup (using Azure CLI commands below)
- GitHub secrets configuration
- Repository setup

**🚀 Ongoing Deployments (AUTOMATED):**
- **Only the `.github/workflows/azure-deploy.yml` file is needed**
- Push to `main` branch = automatic production deployment
- Create PR = automatic staging deployment
- **No manual Azure CLI commands required**

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Azure Setup](#azure-setup)
- [GitHub Repository Setup](#github-repository-setup)
- [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)
- [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
- [Cost Management](#cost-management)

---

## 🔧 Prerequisites

### Required Accounts
- **Azure Account** - [Sign up for free](https://azure.microsoft.com/free/)
- **GitHub Account** - [Sign up](https://github.com)
- **Azure CLI** - [Install Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- **Docker** (for local testing) - [Install Docker](https://www.docker.com/get-started)

### Required Permissions
- Azure subscription with Contributor access
- GitHub repository admin access

---

## ☁️ Azure Setup

### Step 1: Login to Azure CLI
```bash
# Login to your Azure account
az login

# Verify your subscription
az account show

# Set your subscription (if you have multiple)
az account set --subscription "Your-Subscription-ID"
```

### Step 2: Create Resource Group
```bash
# Create a resource group
az group create \
  --name rg-abs-rules-extractor \
  --location "East US"
```

### Step 3: Create Azure Container Registry (ACR)
```bash
# Create Azure Container Registry
az acr create \
  --resource-group rg-abs-rules-extractor \
  --name absrulesregistry \
  --sku Basic \
  --admin-enabled true

# Get ACR login server
az acr show --name absrulesregistry --query loginServer --output table

# Get ACR credentials
az acr credential show --name absrulesregistry
```

**Note down these values:**
- ACR Login Server: `absrulesregistry.azurecr.io`
- Username: (from credential command)
- Password: (from credential command)

### Step 4: Create Azure App Service Plan
```bash
# Create App Service Plan (Linux, Standard tier for production)
az appservice plan create \
  --name asp-abs-rules \
  --resource-group rg-abs-rules-extractor \
  --sku S1 \
  --is-linux
```

### Step 5: Create Azure Web App
```bash
# ⚠️  AUTOMATED - This is done automatically by GitHub Actions!
# The workflow will create the web app if it doesn't exist.
# You DO NOT need to run this command manually.

# If you want to create it manually for testing:
az webapp create \
  --resource-group rg-abs-rules-extractor \
  --plan asp-abs-rules \
  --name abs-rules-extractor-app \
  --deployment-container-image-name absrulesregistry.azurecr.io/abs-rules-extractor:latest
```

**Note:** The GitHub Actions workflow automatically creates the Azure Web App if it doesn't exist, so this step is optional.

### Step 6: Configure Web App Settings
```bash
# Configure container registry credentials
az webapp config container set \
  --name abs-rules-extractor-app \
  --resource-group rg-abs-rules-extractor \
  --container-image-name absrulesregistry.azurecr.io/abs-rules-extractor:latest \
  --container-registry-url https://absrulesregistry.azurecr.io \
  --container-registry-user absrulesregistry \
  --container-registry-password "YOUR-ACR-PASSWORD"

# Configure application settings
az webapp config appsettings set \
  --resource-group rg-abs-rules-extractor \
  --name abs-rules-extractor-app \
  --settings \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
    WEBSITES_PORT=8000 \
    SECRET_KEY="your-super-secret-key-here-change-this" \
    FLASK_ENV=production \
    MAX_CONTENT_LENGTH=104857600 \
    CLEANUP_INTERVAL=3600 \
    MAX_FILE_AGE=86400

# Enable continuous deployment
az webapp deployment container config \
  --resource-group rg-abs-rules-extractor \
  --name abs-rules-extractor-app \
  --enable-cd true
```

### Step 7: Create Service Principal for GitHub Actions
```bash
# Create service principal for GitHub Actions
az ad sp create-for-rbac \
  --name "abs-rules-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/rg-abs-rules-extractor \
  --sdk-auth
```

**Save the entire JSON output - you'll need it for GitHub Secrets!**

---

## 🐙 GitHub Repository Setup

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `abs-rules-extractor`
3. Make it Public or Private (your choice)
4. Initialize with README

### Step 2: Push Your Code to GitHub
```bash
# Navigate to your project directory
cd /Users/leizhengwang/Desktop/subsection_extraction_app2/web_app

# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/YOUR-USERNAME/abs-rules-extractor.git

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: ABS Rules Red Text Extractor"

# Push to GitHub
git push -u origin main
```

### Step 3: Configure GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these **Repository Secrets**:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AZURE_CREDENTIALS` | Entire JSON from service principal creation | Azure authentication |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID | Subscription identifier |
| `ACR_LOGIN_SERVER` | `absrulesregistry.azurecr.io` | Container registry URL |
| `ACR_USERNAME` | Username from ACR credentials | Registry username |
| `ACR_PASSWORD` | Password from ACR credentials | Registry password |
| `AZURE_WEBAPP_NAME` | `abs-rules-extractor-app` | Web app name |
| `RESOURCE_GROUP` | `rg-abs-rules-extractor` | Resource group name |

---

## 🔄 CI/CD Pipeline Configuration

### Step 1: Create GitHub Actions Workflow Directory
```bash
mkdir -p .github/workflows
```

### Step 2: Create Main Deployment Workflow
```yaml
# .github/workflows/azure-deploy.yml
name: Azure CI/CD Pipeline

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.9'

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: Build Docker image
      run: |
        docker build . -t absrulesregistry.azurecr.io/abs-rules-extractor:${{ github.sha }}

    - name: Login to ACR
      run: |
        echo "${{ secrets.ACR_PASSWORD }}" | docker login absrulesregistry.azurecr.io -u "${{ secrets.ACR_USERNAME }}" --password-stdin

    - name: Push Docker image to ACR
      run: |
        docker push absrulesregistry.azurecr.io/abs-rules-extractor:${{ github.sha }}

    - name: Deploy to Azure Web App
      run: |
        az webapp update \
          --name ${{ secrets.AZURE_WEBAPP_NAME }} \
          --resource-group ${{ secrets.RESOURCE_GROUP }} \
          --set containerSettings.image=absrulesregistry.azurecr.io/abs-rules-extractor:${{ github.sha }}
```

### Step 3: Create Environment-Specific Configuration

Create development and production environment files:

#### `.env.development`
```bash
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
MAX_CONTENT_LENGTH=104857600
CLEANUP_INTERVAL=300
MAX_FILE_AGE=3600
```

#### `.env.production`
```bash
FLASK_ENV=production
SECRET_KEY=${SECRET_KEY}
DEBUG=False
MAX_CONTENT_LENGTH=104857600
CLEANUP_INTERVAL=3600
MAX_FILE_AGE=86400
```

---

## 🔧 Environment Configuration

### Step 1: Update Dockerfile for Production
Make sure your Dockerfile is optimized for production:

```dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads output logs static templates

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "300", "--max-requests", "1000", "--max-requests-jitter", "100", "app:app"]
```

### Step 2: Create Docker Compose for Local Testing
Create `docker-compose.azure.yml` for testing Azure-like environment locally:

```yaml
version: '3.8'

services:
  abs-rules-app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=local-test-secret-key
      - DEBUG=False
    volumes:
      - ./uploads:/app/uploads
      - ./output:/app/output
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Step 3: Create Azure Resource Monitoring
Create `azure-monitoring.bicep` for infrastructure as code:

```bicep
param appName string = 'abs-rules-extractor'
param location string = resourceGroup().location
param sku string = 'S1'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: 'asp-${appName}'
  location: location
  kind: 'linux'
  sku: {
    name: sku
  }
  properties: {
    reserved: true
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${appName}-app'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|absrulesregistry.azurecr.io/abs-rules-extractor:latest'
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'WEBSITES_PORT'
          value: '8000'
        }
      ]
    }
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${appName}-insights'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output appInsightsInstrumentationKey string = appInsights.properties.InstrumentationKey
```

---

## 🚀 Deployment Process

### ⚡ **For Ongoing Deployments (After Initial Setup)**

Once you've completed the initial Azure setup and GitHub secrets configuration below, **all future deployments are completely automated**:

#### **Production Deployment:**
1. Make your code changes
2. Commit to any branch: `git add . && git commit -m "your changes"`
3. Push to main: `git push origin main`
4. **That's it!** The Azure deployment happens automatically via GitHub Actions

#### **Staging/Testing Deployment:**
1. Create a Pull Request to `main`
2. **Automatic staging deployment** happens immediately
3. Review your changes at the staging URL posted in the PR comments
4. Merge PR when ready → automatic production deployment

#### **No More Manual Commands Needed:**
- ❌ No Azure CLI commands
- ❌ No manual container builds  
- ❌ No manual deployments
- ✅ Just push code and let GitHub Actions handle everything!

---

### Step 1: Initial Setup Verification
Before deploying, verify your setup:

```bash
# Test local build
docker build -t abs-rules-extractor:local .
docker run -p 8000:8000 abs-rules-extractor:local

# Verify Azure CLI connection
az account show

# Verify ACR connection
az acr login --name absrulesregistry

# Test GitHub Actions locally (optional)
# Install act: https://github.com/nektos/act
act push
```

### Step 2: Deploy Infrastructure (One-time)
```bash
# Deploy Azure infrastructure using Bicep
az deployment group create \
  --resource-group rg-abs-rules-extractor \
  --template-file azure-monitoring.bicep \
  --parameters appName=abs-rules-extractor location="East US"
```

### Step 3: First Deployment
1. **Commit and push your code:**
```bash
git add .
git commit -m "feat: Add Azure CI/CD pipeline with GitHub Actions"
git push origin main
```

2. **Monitor the deployment:**
   - Go to your GitHub repository → Actions tab
   - Watch the workflow execution
   - Check each job status

3. **Verify deployment:**
   - Visit: `https://abs-rules-extractor-app.azurewebsites.net`
   - Check application logs in Azure Portal

### Step 4: Configure Custom Domain (Optional)
```bash
# Add custom domain
az webapp config hostname add \
  --webapp-name abs-rules-extractor-app \
  --resource-group rg-abs-rules-extractor \
  --hostname your-domain.com

# Configure SSL certificate
az webapp config ssl bind \
  --certificate-thumbprint YOUR-CERT-THUMBPRINT \
  --ssl-type SNI \
  --name abs-rules-extractor-app \
  --resource-group rg-abs-rules-extractor
```

---

## 📊 Monitoring and Troubleshooting

### Application Insights Setup
1. **Add Application Insights to your Flask app:**

```python
# Add to app.py
from applicationinsights import TelemetryClient
from applicationinsights.flask.ext import AppInsights

# Initialize Application Insights
app.config['APPINSIGHTS_INSTRUMENTATIONKEY'] = os.environ.get('APPINSIGHTS_INSTRUMENTATIONKEY')
appinsights = AppInsights(app)

# Custom telemetry
tc = TelemetryClient(app.config['APPINSIGHTS_INSTRUMENTATIONKEY'])

@app.route('/upload', methods=['POST'])
def upload_file():
    tc.track_event('FileUpload', {'user_id': 'anonymous'})
    # ... rest of your code
```

### Logging Configuration
Create `logging.conf`:

```ini
[loggers]
keys=root,app

[handlers]
keys=consoleHandler,fileHandler

[formatters]
keys=simpleFormatter

[logger_root]
level=INFO
handlers=consoleHandler

[logger_app]
level=INFO
handlers=consoleHandler,fileHandler
qualname=app

[handler_consoleHandler]
class=StreamHandler
level=INFO
formatter=simpleFormatter
args=(sys.stdout,)

[handler_fileHandler]
class=FileHandler
level=INFO
formatter=simpleFormatter
args=('app.log',)

[formatter_simpleFormatter]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s
```

### Health Monitoring Script
Create `health-check.py`:

```python
#!/usr/bin/env python3
import requests
import sys
import time
from datetime import datetime

def health_check(url, timeout=30, retries=3):
    """Perform health check on the application"""
    for attempt in range(retries):
        try:
            response = requests.get(f"{url}/", timeout=timeout)
            if response.status_code == 200:
                print(f"✅ Health check passed at {datetime.now()}")
                return True
            else:
                print(f"❌ Health check failed: Status {response.status_code}")
        except requests.RequestException as e:
            print(f"❌ Health check failed: {str(e)}")
        
        if attempt < retries - 1:
            print(f"Retrying in 10 seconds... (attempt {attempt + 1}/{retries})")
            time.sleep(10)
    
    return False

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://abs-rules-extractor-app.azurewebsites.net"
    success = health_check(url)
    sys.exit(0 if success else 1)
```

### Common Troubleshooting Commands

```bash
# Check Azure Web App logs
az webapp log tail --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor

# Check container logs
az webapp log download --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor

# Restart the application
az webapp restart --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor

# Check deployment status
az webapp deployment list --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor

# Scale the application
az webapp config set --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor --number-of-workers 2
```

---

## 💰 Cost Management

### Resource Costs (Monthly Estimates)
- **App Service Plan (S1):** ~$56/month
- **Azure Container Registry (Basic):** ~$5/month
- **Application Insights:** ~$0-2/month (first 5GB free)
- **Storage (if needed):** ~$1-5/month
- **Total:** ~$60-70/month

### Cost Optimization Tips

1. **Use B-series VMs for development:**
```bash
az appservice plan update --name asp-abs-rules --resource-group rg-abs-rules-extractor --sku B1
```

2. **Enable auto-scaling:**
```bash
az monitor autoscale create \
  --resource-group rg-abs-rules-extractor \
  --resource /subscriptions/YOUR-SUB-ID/resourceGroups/rg-abs-rules-extractor/providers/Microsoft.Web/serverfarms/asp-abs-rules \
  --name abs-rules-autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

3. **Set up cost alerts:**
```bash
az consumption budget create \
  --amount 100 \
  --budget-name abs-rules-budget \
  --category cost \
  --time-grain monthly \
  --time-period start-date=2024-01-01
```

---

## 🔧 Advanced Configuration

### Blue-Green Deployment
Add to your GitHub Actions workflow:

```yaml
- name: 🔄 Blue-Green Deployment
  run: |
    # Create green slot
    az webapp deployment slot create \
      --name ${{ env.AZURE_WEBAPP_NAME }} \
      --resource-group ${{ env.RESOURCE_GROUP }} \
      --slot green
    
    # Deploy to green slot
    az webapp config container set \
      --name ${{ env.AZURE_WEBAPP_NAME }} \
      --resource-group ${{ env.RESOURCE_GROUP }} \
      --slot green \
      --container-image-name ${{ env.CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
    
    # Health check green slot
    sleep 60
    if curl -f https://${{ env.AZURE_WEBAPP_NAME }}-green.azurewebsites.net/; then
      # Swap slots
      az webapp deployment slot swap \
        --name ${{ env.AZURE_WEBAPP_NAME }} \
        --resource-group ${{ env.RESOURCE_GROUP }} \
        --slot green \
        --target-slot production
    else
      echo "Green slot health check failed"
      exit 1
    fi
```

### Database Integration (if needed)
```bash
# Create Azure Database for PostgreSQL
az postgres server create \
  --resource-group rg-abs-rules-extractor \
  --name abs-rules-db \
  --location "East US" \
  --admin-user absadmin \
  --admin-password "SecurePassword123!" \
  --sku-name GP_Gen5_2

# Configure connection string
az webapp config connection-string set \
  --resource-group rg-abs-rules-extractor \
  --name abs-rules-extractor-app \
  --settings DATABASE_URL="postgresql://absadmin:SecurePassword123!@abs-rules-db.postgres.database.azure.com:5432/postgres" \
  --connection-string-type PostgreSQL
```

---

## 📋 Checklist

### Pre-Deployment Checklist
- [ ] Azure subscription active
- [ ] Resource group created
- [ ] Azure Container Registry created
- [ ] App Service Plan created
- [ ] Web App created and configured
- [ ] Service Principal created for GitHub
- [ ] GitHub repository created
- [ ] All secrets configured in GitHub
- [ ] Dockerfile optimized for production
- [ ] GitHub Actions workflow created
- [ ] Application Insights configured
- [ ] Health checks implemented
- [ ] Logging configured

### Post-Deployment Checklist
- [ ] Application accessible via HTTPS
- [ ] Health checks passing
- [ ] Logs flowing to Application Insights
- [ ] Performance metrics baseline established
- [ ] Security scans passing
- [ ] Cost alerts configured
- [ ] Backup strategy defined
- [ ] Disaster recovery plan documented
- [ ] Team access configured
- [ ] Documentation updated

---

## 🚨 Security Best Practices

### 1. Environment Variables
Never commit sensitive data. Use Azure Key Vault:

```bash
# Create Key Vault
az keyvault create \
  --name abs-rules-keyvault \
  --resource-group rg-abs-rules-extractor \
  --location "East US"

# Add secret
az keyvault secret set \
  --vault-name abs-rules-keyvault \
  --name "secret-key" \
  --value "your-super-secret-key"

# Reference in Web App
az webapp config appsettings set \
  --resource-group rg-abs-rules-extractor \
  --name abs-rules-extractor-app \
  --settings SECRET_KEY="@Microsoft.KeyVault(VaultName=abs-rules-keyvault;SecretName=secret-key)"
```

### 2. Network Security
```bash
# Restrict container registry access
az acr network-rule add \
  --name absrulesregistry \
  --ip-address YOUR-IP-ADDRESS

# Configure Web App firewall
az webapp config access-restriction add \
  --resource-group rg-abs-rules-extractor \
  --name abs-rules-extractor-app \
  --rule-name "AllowOfficeIP" \
  --action Allow \
  --ip-address YOUR-OFFICE-IP/32 \
  --priority 100
```

### 3. Managed Identity
```bash
# Enable system-assigned managed identity
az webapp identity assign \
  --name abs-rules-extractor-app \
  --resource-group rg-abs-rules-extractor

# Grant ACR pull permissions
az role assignment create \
  --assignee $(az webapp identity show --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor --query principalId --output tsv) \
  --scope $(az acr show --name absrulesregistry --query id --output tsv) \
  --role AcrPull
```

---

## 🎯 Next Steps

1. **Test the complete pipeline:**
   - Make a code change
   - Commit and push
   - Monitor deployment
   - Verify production

2. **Set up monitoring dashboards:**
   - Application Insights dashboards
   - Cost monitoring
   - Performance alerts

3. **Implement advanced features:**
   - Auto-scaling rules
   - Blue-green deployments
   - Database integration
   - CDN for static assets

4. **Security hardening:**
   - Penetration testing
   - Security code analysis
   - Compliance checks

---

## 📞 Support and Resources

### Azure Documentation
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Container Registry](https://docs.microsoft.com/en-us/azure/container-registry/)
- [GitHub Actions for Azure](https://docs.microsoft.com/en-us/azure/developer/github/github-actions)

### Troubleshooting Resources
- Azure Portal logs and metrics
- Application Insights analytics
- GitHub Actions logs
- Stack Overflow Azure tags

### Cost Management
- [Azure Pricing Calculator](https://azure.microsoft.com/en-us/pricing/calculator/)
- [Azure Cost Management](https://docs.microsoft.com/en-us/azure/cost-management-billing/)

---

**🎉 Congratulations! You now have a fully automated CI/CD pipeline deploying your ABS Rules Red Text Extractor to Azure!**

For questions or issues, check the troubleshooting section or create an issue in your GitHub repository.
