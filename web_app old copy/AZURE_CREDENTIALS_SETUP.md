# 🔑 Where to Input Azure Credentials - Step-by-Step Guide

## 🎯 **GitHub Secrets Configuration Location**

You need to add Azure credentials as **GitHub Repository Secrets**. Here's exactly where:

### 📍 **Step 1: Navigate to GitHub Secrets**
1. Go to your GitHub repository in your web browser
2. Click on **Settings** tab (top navigation)
3. In the left sidebar, click **Secrets and variables** 
4. Click **Actions**
5. Click **New repository secret**

### 🔗 **Direct URL Path:**
```
https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/settings/secrets/actions
```

---

## 🔑 **Required Secrets to Add**

### **Secret 1: AZURE_CREDENTIALS**
**Name:** `AZURE_CREDENTIALS`
**Value:** Complete JSON from Azure Service Principal (see below how to get it)

### **Secret 2: ACR_USERNAME** 
**Name:** `ACR_USERNAME`
**Value:** Your Azure Container Registry username

### **Secret 3: ACR_PASSWORD**
**Name:** `ACR_PASSWORD` 
**Value:** Your Azure Container Registry password

---

## 🏗️ **How to Get Azure Credentials (Without Azure CLI)**

Since you don't want to use Azure CLI, here are alternative methods:

### **Method 1: Azure Portal (Web Interface)**

#### **Get ACR Credentials:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "Container Registries"
3. Click your registry (e.g., `absrulesregistry`)
4. In left menu, click **Access keys**
5. Enable **Admin user**
6. Copy the **Username** and **password** values

#### **Get Service Principal (AZURE_CREDENTIALS):**
1. Go to [Azure Portal](https://portal.azure.com)
2. Search for "App registrations"
3. Click **New registration**
4. Name it: `abs-rules-github-actions`
5. Register the app
6. Go to **Certificates & secrets** → **Client secrets** → **New client secret**
7. Copy the secret value
8. Go to **Overview** and note down:
   - Application (client) ID
   - Directory (tenant) ID
9. Go to **Subscriptions** → Your subscription → **Access control (IAM)**
10. Add role assignment: Contributor role to your app

**Format the JSON like this:**
```json
{
  "clientId": "your-app-client-id",
  "clientSecret": "your-client-secret-value",
  "subscriptionId": "your-subscription-id",
  "tenantId": "your-tenant-id"
}
```

### **Method 2: Use Cloud Shell (No Local CLI)**
1. Go to [Azure Portal](https://portal.azure.com)
2. Click the **Cloud Shell** icon (>_) in top bar
3. Run these commands:

```bash
# Get ACR credentials
az acr credential show --name absrulesregistry

# Create service principal
az ad sp create-for-rbac \
  --name "abs-rules-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-abs-rules-extractor \
  --sdk-auth
```

---

## 📋 **Step-by-Step Secret Configuration**

### **Adding AZURE_CREDENTIALS:**
1. **Secret name:** `AZURE_CREDENTIALS`
2. **Secret value:** Paste the complete JSON:
```json
{
  "clientId": "12345678-1234-1234-1234-123456789012",
  "clientSecret": "your-secret-here",
  "subscriptionId": "87654321-4321-4321-4321-210987654321", 
  "tenantId": "11111111-1111-1111-1111-111111111111"
}
```
3. Click **Add secret**

### **Adding ACR_USERNAME:**
1. **Secret name:** `ACR_USERNAME`
2. **Secret value:** `absrulesregistry` (your ACR admin username)
3. Click **Add secret**

### **Adding ACR_PASSWORD:**
1. **Secret name:** `ACR_PASSWORD`
2. **Secret value:** (the password from ACR access keys)
3. Click **Add secret**

---

## 🔍 **How Secrets Are Used in Your Workflow**

Your `azure-deploy.yml` file references these secrets like this:

```yaml
# For Azure authentication
- name: 🔐 Login to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}

# For Container Registry
- name: 🔐 Login to Azure Container Registry
  uses: azure/docker-login@v1
  with:
    login-server: absrulesregistry.azurecr.io
    username: ${{ secrets.ACR_USERNAME }}
    password: ${{ secrets.ACR_PASSWORD }}
```

---

## ✅ **Verification Checklist**

After adding secrets, verify:
- [ ] 3 secrets added to GitHub repository
- [ ] Secret names match exactly (case-sensitive)
- [ ] AZURE_CREDENTIALS is valid JSON format
- [ ] ACR credentials have admin access enabled

---

## 🚨 **Common Issues & Solutions**

### **Issue: "Secret not found"**
**Solution:** Check secret name spelling (case-sensitive)

### **Issue: "Azure login failed"**
**Solution:** Verify JSON format and service principal permissions

### **Issue: "ACR login failed"**  
**Solution:** Enable admin user in ACR access keys

---

## 🎯 **Quick Test**

After configuring secrets, test by:
1. Making a small code change
2. Committing: `git add . && git commit -m "test deployment"`
3. Pushing: `git push origin main`
4. Check GitHub Actions tab for workflow execution

---

## 💡 **Pro Tips**

- **Never commit secrets to code** - Always use GitHub Secrets
- **Rotate secrets regularly** for security
- **Use least privilege** - Only grant necessary permissions
- **Monitor secret usage** in GitHub Actions logs

The secrets are encrypted and only accessible to your GitHub Actions workflows!
