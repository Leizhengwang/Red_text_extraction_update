# 🚀 Quick Start - Running the App Locally

## Option 1: Using the Quick Start Script (Easiest!)

```bash
cd /Users/leizhengwang/Desktop/web_appCopy/web_app
./run_local.sh
```

That's it! The script will:
- ✅ Activate the virtual environment
- ✅ Install/update all dependencies
- ✅ Create necessary folders
- ✅ Start the Flask app

Then open: **http://127.0.0.1:5000**

---

## Option 2: Manual Steps

```bash
# 1. Navigate to the app folder
cd /Users/leizhengwang/Desktop/web_appCopy/web_app

# 2. Activate virtual environment
source ../venv_main/bin/activate

# 3. Install dependencies (if needed)
pip install -r requirements.txt

# 4. Run the app
python app.py
```

Then open: **http://127.0.0.1:5000**

---

## 🛑 Stopping the App

Press `CTRL+C` in the terminal

---

## 📝 What to Expect

When you run the app, you'll see:

```
════════════════════════════════════════════════════════════
🚀 Starting Red Text Extractor - Local Deployment
════════════════════════════════════════════════════════════

📁 Working Directory: /Users/leizhengwang/Desktop/web_appCopy/web_app
🐍 Virtual Environment: /Users/leizhengwang/Desktop/web_appCopy/venv_main

🔄 Activating virtual environment...
✅ Virtual environment activated

📦 Checking dependencies...
✅ Dependencies installed!

📁 Creating necessary folders...
✅ Folders ready: uploads, output, logs

════════════════════════════════════════════════════════════
✅ Ready to start!
════════════════════════════════════════════════════════════

🌐 The app will be available at:
   • http://127.0.0.1:5000 (recommended)
   • http://localhost:5000

🛑 To stop the server: Press CTRL+C

════════════════════════════════════════════════════════════
🚀 Starting Flask application...
════════════════════════════════════════════════════════════

📁 UPLOAD_FOLDER: /Users/leizhengwang/Desktop/web_appCopy/web_app/uploads
📁 OUTPUT_FOLDER: /Users/leizhengwang/Desktop/web_appCopy/web_app/output
✅ Upload folder writable: True
✅ Output folder writable: True

 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

---

## 🧪 Testing the Fix

1. **Open the app:** http://127.0.0.1:5000

2. **Upload a PDF with red text**

3. **Watch the terminal logs:**
   ```
   📖 Reading PDF from: /path/to/file.pdf
   ✅ PDF loaded into memory: 245678 bytes
   
   🔬 DEBUG: Analyzing ALL colors in PDF
   🎨 Found 3 unique colors:
     RGB(0, 0, 0) - "Regular text"
     RGB(218, 31, 51) - "Important text" 🎯 TARGET RED!
   
   🔴 Red text found on page 1: 'Important text...'
   ✅ Red content extraction SUCCESSFUL
   ```

4. **Download the Word document** and verify red content was extracted

---

## ✅ Success Indicators

You should see these in the terminal:

- ✅ `📖 Reading PDF from:` - File is being read
- ✅ `✅ PDF loaded into memory:` - **THE FIX IS WORKING!**
- ✅ `🎯 TARGET RED!` - Red color detected
- ✅ `🔴 Red text found on page X` - Red text extracted
- ✅ `✅ Red content extraction SUCCESSFUL` - Process complete

---

## 🔧 Troubleshooting

### Problem: "Permission denied: ./run_local.sh"

```bash
chmod +x run_local.sh
./run_local.sh
```

### Problem: "Virtual environment not found"

The script will create it automatically, or you can create it manually:

```bash
cd /Users/leizhengwang/Desktop/web_appCopy
python3 -m venv venv_main
```

### Problem: Port 5000 already in use

```bash
# Kill the process using port 5000
kill -9 $(lsof -ti:5000)
```

### Problem: "No module named 'flask'"

```bash
source ../venv_main/bin/activate
pip install -r requirements.txt
```

---

## 📚 More Documentation

- **Detailed Local Deployment:** See `LOCAL_DEPLOYMENT.md`
- **Azure Deployment:** See `DEPLOYMENT_GUIDE.md`
- **Bug Fix Details:** See `BUG_FIX_SUMMARY.md`
- **All Changes:** See `DEPLOYMENT_CHANGES.md`

---

## 🎯 Next Steps

After confirming the app works locally:

1. **Commit your changes:**
   ```bash
   cd /Users/leizhengwang/Desktop/web_appCopy
   git add .
   git commit -m "Fix: Read PDF into memory - fixes Azure processing bug"
   ```

2. **Push to GitHub to deploy to Azure:**
   ```bash
   git push origin main
   ```

3. **Monitor Azure deployment:**
   - Check GitHub Actions
   - Monitor Azure logs
   - Test on Azure URL

---

**Need Help?** Check the detailed guides in the documentation files!
