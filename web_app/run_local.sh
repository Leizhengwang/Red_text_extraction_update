#!/bin/bash

# Local Deployment Script for Red Text Extractor
# Usage: ./run_local.sh

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════"
echo "🚀 Starting Red Text Extractor - Local Deployment"
echo "════════════════════════════════════════════════════════════"
echo ""

# Check current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WEB_APP_DIR="$SCRIPT_DIR"
VENV_DIR="$(dirname "$SCRIPT_DIR")/venv_main"

echo "📁 Working Directory: $WEB_APP_DIR"
echo "🐍 Virtual Environment: $VENV_DIR"
echo ""

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo "❌ Virtual environment not found at: $VENV_DIR"
    echo ""
    echo "Creating virtual environment..."
    cd "$(dirname "$SCRIPT_DIR")"
    python3 -m venv venv_main
    echo "✅ Virtual environment created!"
    echo ""
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source "$VENV_DIR/bin/activate"

if [ $? -eq 0 ]; then
    echo "✅ Virtual environment activated: $(which python)"
else
    echo "❌ Failed to activate virtual environment"
    exit 1
fi
echo ""

# Install/update dependencies
echo "📦 Checking dependencies..."
if [ -f "$WEB_APP_DIR/requirements.txt" ]; then
    echo "📥 Installing/updating packages from requirements.txt..."
    pip install -q -r "$WEB_APP_DIR/requirements.txt"
    echo "✅ Dependencies installed!"
else
    echo "⚠️  requirements.txt not found, skipping dependency installation"
fi
echo ""

# Create necessary folders
echo "📁 Creating necessary folders..."
cd "$WEB_APP_DIR"
mkdir -p uploads output logs
chmod 755 uploads output logs 2>/dev/null || true
echo "✅ Folders ready: uploads, output, logs"
echo ""

# Check if app.py exists
if [ ! -f "$WEB_APP_DIR/app.py" ]; then
    echo "❌ app.py not found in: $WEB_APP_DIR"
    exit 1
fi

# Display info
echo "════════════════════════════════════════════════════════════"
echo "✅ Ready to start!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🌐 The app will be available at:"
echo "   • http://127.0.0.1:5000 (recommended)"
echo "   • http://localhost:5000"
echo ""
echo "📊 Folders:"
echo "   • Uploads: $WEB_APP_DIR/uploads"
echo "   • Output:  $WEB_APP_DIR/output"
echo "   • Logs:    $WEB_APP_DIR/logs"
echo ""
echo "🛑 To stop the server: Press CTRL+C"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🚀 Starting Flask application..."
echo "════════════════════════════════════════════════════════════"
echo ""

# Start the application
cd "$WEB_APP_DIR"
python app.py

# This will only execute after CTRL+C
echo ""
echo "════════════════════════════════════════════════════════════"
echo "👋 Application stopped"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "💡 Tips:"
echo "   • To restart: ./run_local.sh"
echo "   • To deactivate venv: deactivate"
echo "   • To clean files: rm -rf uploads/* output/*"
echo ""
