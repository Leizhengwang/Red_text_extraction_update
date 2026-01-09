# 🚀 Quick Reference: Azure CI/CD with GitHub Actions

## 📋 Overview
Complete Azure deployment using **ONE YAML FILE** with GitHub Actions CI/CD pipeline.

---

## 🎯 What You Get

### ✅ **Complete CI/CD Pipeline:**
- **Build & Test** → **Docker Build** → **Deploy** → **Security Scan** → **Performance Test**
- **Auto-deployment** to Azure App Service
- **PR staging environments**
- **Health checks & monitoring**
- **Security vulnerability scanning**

### ✅ **Essential Files Only:**
```
📁 Project Structure:
├── .github/workflows/
│   └── azure-deploy.yml         # Complete CI/CD pipeline (THE ONLY FILE YOU NEED!)
├── .vscode/                     # VS Code configuration
├── app.py                       # Flask application
├── config.py                    # App configuration  
├── Dockerfile                   # Docker container setup
├── docker-compose.yml           # Local Docker testing
├── deploy.sh                    # Local deployment script
├── requirements.txt             # Python dependencies
├── README.md                    # Project documentation
├── AZURE_CICD_DEPLOYMENT.md     # Detailed Azure setup guide
├── QUICK_REFERENCE.md           # This quick reference
├── templates/                   # HTML templates
├── static/                      # CSS/JS assets
├── uploads/                     # File upload directory
├── output/                      # Generated files
└── logs/                        # Application logs
```

---

## 🚀 Quick Setup (5 Steps)

### **Step 1: Azure Resources**
```bash
# Create resource group
az group create --name rg-abs-rules-extractor --location "East US"

# Create container registry
az acr create --name absrulesregistry --resource-group rg-abs-rules-extractor --sku Basic --admin-enabled true

# Create app service plan
az appservice plan create --name asp-abs-rules --resource-group rg-abs-rules-extractor --sku S1 --is-linux

# Create web app
az webapp create --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor --plan asp-abs-rules --deployment-container-image-name absrulesregistry.azurecr.io/abs-rules-extractor:latest

# Create service principal
az ad sp create-for-rbac --name "abs-rules-github-actions" --role contributor --scopes /subscriptions/YOUR-SUB-ID/resourceGroups/rg-abs-rules-extractor --sdk-auth
```

### **Step 2: GitHub Repository**
```bash
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/abs-rules-extractor.git
git add .
git commit -m "feat: Add Azure CI/CD pipeline"
git push -u origin main
```

### **Step 3: GitHub Secrets**
Go to **Repository → Settings → Secrets and variables → Actions**

| Secret Name | Value | Source |
|-------------|-------|---------|
| `AZURE_CREDENTIALS` | Complete JSON from service principal | Step 1 output |
| `AZURE_SUBSCRIPTION_ID` | Your subscription ID | `az account show` |
| `ACR_LOGIN_SERVER` | `absrulesregistry.azurecr.io` | Step 1 |
| `ACR_USERNAME` | Registry username | `az acr credential show` |
| `ACR_PASSWORD` | Registry password | `az acr credential show` |
| `AZURE_WEBAPP_NAME` | `abs-rules-extractor-app` | Step 1 |
| `RESOURCE_GROUP` | `rg-abs-rules-extractor` | Step 1 |

### **Step 4: Configure Web App**
```bash
az webapp config appsettings set \
  --resource-group rg-abs-rules-extractor \
  --name abs-rules-extractor-app \
  --settings \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
    WEBSITES_PORT=8000 \
    SECRET_KEY="your-super-secret-key-here" \
    FLASK_ENV=production
```

### **Step 5: Deploy**
```bash
# Push to trigger deployment
git push origin main

# Monitor at: https://github.com/YOUR-USERNAME/abs-rules-extractor/actions
# Access app at: https://abs-rules-extractor-app.azurewebsites.net
```

---

## 🔄 Workflow Jobs

### **1. 🔨 Build & Test**
- Python setup & dependency installation
- Code linting with flake8
- Unit tests execution
- Coverage reporting

### **2. 🐳 Build Docker Image**
- Docker build with multiple tags
- Push to Azure Container Registry
- Image vulnerability scanning

### **3. 🚀 Deploy to Production**
- **Triggers:** Push to `main` branch
- Azure Web App deployment
- Health checks with retries
- **URL:** `https://abs-rules-extractor-app.azurewebsites.net`

### **4. 🧪 Deploy to Staging**
- **Triggers:** Pull requests
- Staging slot deployment
- PR comment with staging URL
- **URL:** `https://abs-rules-extractor-app-staging.azurewebsites.net`

### **5. 🔒 Security Scan**
- Trivy vulnerability scanner
- SARIF report upload
- Security alerts in GitHub

### **6. ⚡ Performance Test**
- k6 load testing
- Response time validation
- Performance metrics

---

## 📊 Monitoring & Troubleshooting

### **Health Check Commands:**
```bash
# Run health check
python health-check.py https://abs-rules-extractor-app.azurewebsites.net

# Check Azure logs
az webapp log tail --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor

# Restart app
az webapp restart --name abs-rules-extractor-app --resource-group rg-abs-rules-extractor
```

### **Local Testing:**
```bash
# Test Azure-like environment locally
docker-compose -f docker-compose.azure.yml up

# Run tests
python -m pytest test_app.py -v

# Performance test
k6 run performance-test.js
```

---

## 💰 Cost Estimate
- **App Service Plan (S1):** ~$56/month
- **Azure Container Registry:** ~$5/month
- **Application Insights:** ~$2/month
- **Total:** ~$63/month

---

## 🎯 Key Features

### **✅ Production Ready:**
- Multi-environment deployment (prod/staging)
- Blue-green deployment support
- Auto-scaling capability
- SSL/HTTPS enabled
- Health monitoring
- Performance testing

### **✅ Security:**
- Container vulnerability scanning
- Managed identity authentication
- Key Vault integration
- Network access restrictions
- Security headers validation

### **✅ DevOps Best Practices:**
- Infrastructure as Code (Bicep)
- Automated testing
- Code quality checks
- Deployment slots
- Rollback capability
- Monitoring & alerting

---

## 🚨 Important Notes

### **First Deployment:**
1. **Manual ACR setup required** (one-time)
2. **GitHub secrets must be configured** before first push
3. **Azure resources created via CLI** (automated with Bicep optional)
4. **Initial deployment takes 5-10 minutes**

### **Subsequent Deployments:**
- **Automatic** on every push to `main`
- **~3-5 minutes** deployment time
- **Zero-downtime** deployment
- **Automatic rollback** on health check failure

---

## 📞 Quick Help

### **Common Issues:**
1. **"Permission denied"** → Check service principal permissions
2. **"Image not found"** → Verify ACR credentials in secrets
3. **"Health check failed"** → Check application logs in Azure Portal
4. **"Deployment timeout"** → Increase health check timeout in workflow

### **Useful Links:**
- **GitHub Actions:** [Repository Actions Tab](https://github.com/YOUR-USERNAME/abs-rules-extractor/actions)
- **Azure Portal:** [App Service Dashboard](https://portal.azure.com)
- **Application URL:** [https://abs-rules-extractor-app.azurewebsites.net](https://abs-rules-extractor-app.azurewebsites.net)

---

## 🎉 Success!

**You now have enterprise-grade CI/CD with:**
- ✅ Automated testing
- ✅ Container deployment
- ✅ Multi-environment support
- ✅ Security scanning
- ✅ Performance monitoring
- ✅ Zero-downtime deployment

**All managed by ONE YAML file!** 🚀
