# 🔑 GitHub Secrets Configuration Guide

## ⚠️ CRITICAL: You MUST configure these GitHub Secrets before the workflow will work!

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

---

## 🔑 Required GitHub Secrets (7 total)

### 1. `AZURE_CREDENTIALS` 🔐
**What it is:** Complete Azure Service Principal authentication JSON  
**How to get it:** Run this Azure CLI command:
```bash
az ad sp create-for-rbac \
  --name "abs-rules-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR-SUBSCRIPTION-ID/resourceGroups/rg-abs-rules-extractor \
  --sdk-auth
```
**Example value:**
```json
{
  "clientId": "12345678-1234-1234-1234-123456789012",
  "clientSecret": "your-secret-here",
  "subscriptionId": "87654321-4321-4321-4321-210987654321",
  "tenantId": "11111111-1111-1111-1111-111111111111"
}
```
**⚠️ Copy the ENTIRE JSON output and paste it as the secret value**

### 2. `AZURE_SUBSCRIPTION_ID` 🌐
**What it is:** Your Azure subscription ID  
**How to get it:** 
```bash
az account show --query id --output tsv
```
**Example value:** `87654321-4321-4321-4321-210987654321`

### 3. `ACR_USERNAME` 👤
**What it is:** Azure Container Registry username  
**How to get it:**
```bash
az acr credential show --name absrulesregistry --query username --output tsv
```
**Example value:** `absrulesregistry`

### 4. `ACR_PASSWORD` 🔒
**What it is:** Azure Container Registry password  
**How to get it:**
```bash
az acr credential show --name absrulesregistry --query passwords[0].value --output tsv
```
**Example value:** `SomeRandomPassword123=`

### 5. `ACR_LOGIN_SERVER` 🌐
**What it is:** Azure Container Registry server URL  
**How to get it:**
```bash
az acr show --name absrulesregistry --query loginServer --output tsv
```
**Example value:** `absrulesregistry.azurecr.io`

### 6. `AZURE_WEBAPP_NAME` 🌐
**What it is:** Your Azure Web App name  
**Value:** `abs-rules-extractor-app`
**Note:** This matches the environment variable in the YAML file

### 7. `RESOURCE_GROUP` 📁
**What it is:** Your Azure Resource Group name  
**Value:** `rg-abs-rules-extractor`
**Note:** This matches the environment variable in the YAML file

---

## 🎯 Where These Secrets Are Used in the Workflow

### In Job 2 (Build Docker):
```yaml
- name: 🔐 Login to Azure Container Registry
  uses: azure/docker-login@v1
  with:
    login-server: ${{ env.CONTAINER_REGISTRY }}  # Uses ACR_LOGIN_SERVER
    username: ${{ secrets.ACR_USERNAME }}        # 🔑 SECRET USED HERE
    password: ${{ secrets.ACR_PASSWORD }}        # 🔑 SECRET USED HERE
```

### In Job 3 (Deploy Production):
```yaml
- name: 🔐 Login to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}      # 🔑 SECRET USED HERE
```

### In Job 4 (Deploy Staging):
```yaml
- name: 🔐 Login to Azure
  uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}      # 🔑 SECRET USED HERE (same as production)
```

---

## 🛠️ Quick Setup Commands

Run these commands to get all the values you need:

```bash
# 1. Login to Azure
az login

# 2. Create service principal and get AZURE_CREDENTIALS
az ad sp create-for-rbac \
  --name "abs-rules-github-actions" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-abs-rules-extractor \
  --sdk-auth

# 3. Get subscription ID
echo "AZURE_SUBSCRIPTION_ID: $(az account show --query id -o tsv)"

# 4. Get ACR credentials
echo "ACR_USERNAME: $(az acr credential show --name absrulesregistry --query username -o tsv)"
echo "ACR_PASSWORD: $(az acr credential show --name absrulesregistry --query passwords[0].value -o tsv)"
echo "ACR_LOGIN_SERVER: $(az acr show --name absrulesregistry --query loginServer -o tsv)"

# 5. Static values
echo "AZURE_WEBAPP_NAME: abs-rules-extractor-app"
echo "RESOURCE_GROUP: rg-abs-rules-extractor"
```

---

## ✅ GitHub Secrets Configuration Checklist

- [ ] **AZURE_CREDENTIALS** - Complete JSON from service principal creation
- [ ] **AZURE_SUBSCRIPTION_ID** - Your Azure subscription ID
- [ ] **ACR_USERNAME** - Container registry username
- [ ] **ACR_PASSWORD** - Container registry password  
- [ ] **ACR_LOGIN_SERVER** - Container registry URL
- [ ] **AZURE_WEBAPP_NAME** - Web app name
- [ ] **RESOURCE_GROUP** - Resource group name

---

## 🚨 Security Notes

1. **Never commit secrets to git** - Always use GitHub Secrets
2. **Service Principal** has minimum required permissions (contributor on resource group only)
3. **Rotate passwords periodically** - Update ACR password every 90 days
4. **Monitor access** - Check Azure Activity Log for service principal usage

---

## 🔧 Environment Variables vs Secrets

**Environment Variables (in YAML file):**
- `AZURE_WEBAPP_NAME` - Not sensitive, can be in code
- `RESOURCE_GROUP` - Not sensitive, can be in code  
- `CONTAINER_REGISTRY` - Not sensitive, can be in code
- `IMAGE_NAME` - Not sensitive, can be in code

**GitHub Secrets (hidden):**
- `AZURE_CREDENTIALS` - 🔒 SENSITIVE - Service principal JSON
- `ACR_USERNAME` - 🔒 SENSITIVE - Registry login
- `ACR_PASSWORD` - 🔒 SENSITIVE - Registry password
- All other secret values above

---

## 🎯 Testing Your Setup

After configuring all secrets:

1. **Commit and push to main branch:**
   ```bash
   git add .
   git commit -m "feat: Add Azure CI/CD pipeline"
   git push origin main
   ```

2. **Watch the workflow run:**
   - Go to GitHub → Your Repository → Actions tab
   - Click on the running workflow
   - Monitor each job

3. **Check for errors:**
   - If authentication fails → Check `AZURE_CREDENTIALS`
   - If Docker push fails → Check `ACR_USERNAME` and `ACR_PASSWORD`
   - If deployment fails → Check resource names in environment variables

---

**✅ Once all secrets are configured correctly, your Azure CI/CD pipeline will run automatically!** 🚀
