# ABS Rules Red Text Extractor

A professional web application for extracting red-highlighted text from ABS (American Bureau of Shipping) rule PDF documents and converting them into editable Word documents.

## Features

🔍 **Advanced Red Text Detection** - Automatically identifies and extracts red-highlighted content from PDF documents  
📊 **Table Preservation** - Maintains table structure and formatting from original PDF documents  
📝 **Word Document Output** - Generates editable Word documents with positioned content  
🎨 **Beautiful Web Interface** - Modern, responsive design with drag-and-drop file upload  
⚡ **Fast Processing** - Efficient processing engine with progress tracking  
📦 **Batch Processing** - Handle multiple PDF files simultaneously  
💾 **Download Options** - Individual file downloads or bulk ZIP download  

## Quick Start

### Option 1: Windows Development Setup

1. **Run the deployment script:**
   ```bash
   deploy.bat
   ```

2. **Access the application:**
   - Open your browser and go to `http://localhost:8000`

### Option 2: Docker Deployment (Recommended for Production)

1. **Make sure Docker is installed on your system**

2. **Run the deployment script:**
   ```bash
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh
   
   # Or manually:
   docker-compose up -d
   ```

3. **Access the application:**
   - Open your browser and go to `http://localhost:8000`

### Option 3: Manual Setup

1. **Clone or download this repository**

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # or
   venv\Scripts\activate.bat  # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

## How to Use

1. **Upload PDF Files**
   - Drag and drop PDF files onto the upload area
   - Or click "Choose Files" to browse and select files
   - Supports multiple file upload (up to 100MB per file)

2. **Process Files**
   - Click "Process Files" to start extraction
   - Monitor progress with the progress bar
   - Processing time depends on file size and complexity

3. **Download Results**
   - Download individual Word documents
   - Or download all files as a ZIP archive
   - Files are automatically cleaned up after processing

## Technical Details

### Core Technologies
- **Backend:** Flask (Python web framework)
- **PDF Processing:** PyMuPDF (fast PDF manipulation)
- **Table Extraction:** pdfplumber (advanced table detection)
- **Word Generation:** python-docx (Word document creation)
- **Frontend:** Bootstrap 5, JavaScript ES6, CSS3

### Processing Pipeline
1. **PDF Analysis:** Extract text blocks with font and color information
2. **Red Text Detection:** Identify text with RGB color (218, 31, 51)
3. **Table Processing:** Extract tables containing red text using pdfplumber
4. **Image Rendering:** Convert selected content to high-DPI images
5. **Word Generation:** Create positioned Word documents with extracted content

### File Structure
```
web_app/
├── app.py                 # Main Flask application
├── config.py             # Configuration settings
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── deploy.sh/.bat       # Deployment scripts
├── templates/
│   └── index.html       # Main web interface
├── static/
│   ├── css/
│   │   └── style.css    # Custom styling
│   └── js/
│       └── app.js       # Frontend JavaScript
├── uploads/             # Temporary file storage
└── output/              # Generated Word documents
```

## Configuration

### Environment Variables
- `SECRET_KEY`: Flask secret key for security
- `UPLOAD_FOLDER`: Directory for uploaded files (default: uploads)
- `OUTPUT_FOLDER`: Directory for generated files (default: output)
- `MAX_CONTENT_LENGTH`: Maximum file size in bytes (default: 100MB)
- `CLEANUP_INTERVAL`: File cleanup interval in seconds (default: 3600)
- `MAX_FILE_AGE`: Maximum file age before cleanup (default: 86400)

### Security Features
- File type validation (PDF only)
- File size limits
- Secure filename handling
- Automatic file cleanup
- CSRF protection
- Input sanitization

## Deployment Options

### Development
- Run `deploy.bat` (Windows) or `python app.py`
- Access at `http://localhost:8000`
- Debug mode enabled
- Auto-reload on code changes

### Production
- Use Docker deployment with `docker-compose up -d`
- Configure reverse proxy (Nginx) for HTTPS
- Set production environment variables
- Enable logging and monitoring
- Scale with multiple workers

### Cloud Deployment
The application can be deployed to various cloud platforms:
- **AWS:** Use ECS or Elastic Beanstalk
- **Google Cloud:** Use Cloud Run or App Engine
- **Azure:** Use Container Instances or App Service
- **Heroku:** Use container deployment

## API Endpoints

- `GET /` - Main interface
- `POST /upload` - Upload and process files
- `GET /download/<filename>` - Download individual file
- `GET /download_all/<job_id>` - Download all files as ZIP
- `GET /status/<job_id>` - Check processing status

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance

- **Processing Speed:** ~30 seconds per PDF file
- **Memory Usage:** ~100MB per concurrent job
- **Concurrent Jobs:** Configurable (default: 5)
- **File Size Limit:** 100MB per file
- **Batch Size:** No limit on number of files

## Troubleshooting

### Common Issues

1. **Large File Upload Fails**
   - Check file size limit (100MB default)
   - Increase `MAX_CONTENT_LENGTH` if needed

2. **Processing Takes Too Long**
   - Complex PDFs require more time
   - Check server resources (CPU, memory)
   - Consider increasing timeout values

3. **Docker Issues**
   - Ensure Docker daemon is running
   - Check port 8000 availability
   - Verify Docker Compose version

### Logs
- Application logs: `docker-compose logs -f`
- Error logs: Check browser developer console
- Server logs: Check Flask application output

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Check the troubleshooting section
- Review the application logs
- Create an issue in the repository

## Version History

- **v1.0.0** - Initial release with core PDF processing functionality
- **v1.1.0** - Added batch processing and improved UI
- **v1.2.0** - Docker support and production deployment features

---

**Built with ❤️ for ABS Rules Processing**