@echo off
REM ABS Rules Red Text Extractor - Windows Deployment Script

echo 🚀 Starting deployment of ABS Rules Red Text Extractor...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Check if pip is installed
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip is not installed. Please install pip first.
    exit /b 1
)

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Create necessary directories
echo 📁 Creating directories...
if not exist uploads mkdir uploads
if not exist output mkdir output
if not exist logs mkdir logs

REM Set environment variables for development
set FLASK_APP=app.py
set FLASK_ENV=development
set SECRET_KEY=dev-secret-key

REM Start the application
echo 🏃 Starting the application...
echo ✅ Application will be available at: http://localhost:5000
echo 🛑 Press Ctrl+C to stop the application
echo.

python app.py

echo 🎉 Application stopped.
pause