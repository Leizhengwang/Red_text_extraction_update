// ABS Rules Red Text Extractor JavaScript

class PDFExtractor {
    constructor() {
        this.selectedFiles = [];
        this.currentJobId = null;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File input change
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Drag and drop
        const uploadArea = document.getElementById('uploadArea');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleFileSelection(e.dataTransfer.files);
        });

        // Process button
        document.getElementById('processBtn').addEventListener('click', () => {
            this.processFiles();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetInterface();
        });

        // Download all button
        document.getElementById('downloadAllBtn').addEventListener('click', () => {
            this.downloadAllFiles();
        });
    }

    handleFileSelection(files) {
        const validFiles = Array.from(files).filter(file => {
            if (file.type !== 'application/pdf') {
                this.showError(`${file.name} is not a PDF file. Please select only PDF files.`);
                return false;
            }
            if (file.size > 1024 * 1024 * 1024) { // 1GB per file limit
                this.showError(`${file.name} is too large. Maximum file size is 1GB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Add new files to selected files (avoid duplicates)
        validFiles.forEach(file => {
            if (!this.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
                this.selectedFiles.push(file);
            }
        });
        
        // Check total size
        const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 4.8 * 1024 * 1024 * 1024) { // 4.8GB total to leave some margin
            this.showError(`Total file size (${this.formatFileSize(totalSize)}) exceeds 4.8GB limit. Please remove some files.`);
            return;
        }

        this.displaySelectedFiles();
        this.hideError();
    }

    displaySelectedFiles() {
        const filesListElement = document.getElementById('filesList');
        const selectedFilesElement = document.getElementById('selectedFiles');

        if (this.selectedFiles.length === 0) {
            selectedFilesElement.style.display = 'none';
            return;
        }

        selectedFilesElement.style.display = 'block';
        
        filesListElement.innerHTML = this.selectedFiles.map((file, index) => `
            <div class="list-group-item file-item fade-in">
                <div class="file-info">
                    <i class="fas fa-file-pdf file-icon"></i>
                    <div>
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <i class="fas fa-times file-remove" onclick="pdfExtractor.removeFile(${index})" title="Remove file"></i>
            </div>
        `).join('');
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.displaySelectedFiles();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processFiles() {
        if (this.selectedFiles.length === 0) {
            this.showError('Please select at least one PDF file to process.');
            return;
        }

        this.showProcessingStatus();
        
        const formData = new FormData();
        this.selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            // Step 1: Upload files
            this.updateProgress(10, 'Uploading files...');
            
            const uploadResponse = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok || !uploadResult.success) {
                throw new Error(uploadResult.error || 'Upload failed');
            }

            this.currentJobId = uploadResult.job_id;
            const totalFiles = uploadResult.total_files;
            
            // Step 2: Start processing
            this.updateProgress(20, `Processing ${totalFiles} file(s)...`);
            
            fetch(`/process/${this.currentJobId}`, {
                method: 'POST'
            }).then(response => response.json())
              .catch(error => console.error('Processing error:', error));
            
            // Step 3: Poll for progress
            await this.pollProgress(this.currentJobId, totalFiles);

        } catch (error) {
            console.error('Error processing files:', error);
            this.hideProcessingStatus();
            this.showError(`Processing failed: ${error.message}`);
        }
    }

    async pollProgress(jobId, totalFiles) {
        const pollInterval = 500; // Poll every 500ms
        
        return new Promise((resolve, reject) => {
            const intervalId = setInterval(async () => {
                try {
                    const response = await fetch(`/progress/${jobId}`);
                    const progress = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(progress.error || 'Failed to get progress');
                    }
                    
                    // Use current_index to show which file is being worked on
                    const currentFileNum = progress.current_index || progress.processed;
                    const percentage = 20 + (progress.processed / progress.total) * 75;
                    
                    let currentFileMsg;
                    if (progress.status === 'processing' && progress.current_file) {
                        currentFileMsg = `Currently processing: ${progress.current_file} (${currentFileNum} of ${progress.total})`;
                    } else if (progress.processed < progress.total) {
                        currentFileMsg = `Processing file ${currentFileNum} of ${progress.total}...`;
                    } else {
                        currentFileMsg = `Completed ${progress.processed} of ${progress.total} files`;
                    }
                    
                    this.updateProgress(percentage, currentFileMsg);
                    
                    // Update individual file results as they complete
                    if (progress.results.length > 0) {
                        this.updateIndividualResults(progress.results);
                    }
                    
                    if (progress.status === 'completed') {
                        clearInterval(intervalId);
                        this.updateProgress(100, 'All files processed!');
                        setTimeout(() => {
                            this.showResults({
                                job_id: jobId,
                                files: progress.results,
                                message: `Successfully processed ${progress.total} file(s)`
                            });
                            resolve();
                        }, 1000);
                    } else if (progress.status === 'failed') {
                        clearInterval(intervalId);
                        reject(new Error(progress.error || 'Processing failed'));
                    }
                    
                } catch (error) {
                    clearInterval(intervalId);
                    reject(error);
                }
            }, pollInterval);
        });
    }

    updateIndividualResults(results) {
        // Show intermediate results in processing status
        const statusDiv = document.getElementById('processingStatus');
        let resultsHtml = statusDiv.querySelector('.intermediate-results');
        
        if (!resultsHtml) {
            resultsHtml = document.createElement('div');
            resultsHtml.className = 'intermediate-results mt-3';
            statusDiv.querySelector('.card-body').appendChild(resultsHtml);
        }
        
        resultsHtml.innerHTML = `
            <div class="alert alert-success mt-3">
                <h6 class="mb-3">
                    <i class="fas fa-check-circle me-2"></i>
                    Completed Files (${results.length}):
                </h6>
                <div class="list-group">
                    ${results.map((file, idx) => {
                        const displayName = file.display_name || file.original_name.replace('.pdf', '.docx');
                        return `
                        <div class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <i class="fas fa-file-word text-success me-2"></i>
                                <strong>${displayName}</strong>
                                <br>
                                <small class="text-muted">From: ${file.original_name}</small>
                            </div>
                            <button class="btn btn-success" onclick="pdfExtractor.downloadFile('${file.word_file}', '${displayName}')">
                                <i class="fas fa-download me-2"></i>
                                Download Now
                            </button>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    showProcessingStatus() {
        document.getElementById('processingStatus').style.display = 'block';
        document.getElementById('processingStatus').classList.add('slide-up');
        document.getElementById('selectedFiles').style.display = 'none';
        this.updateProgress(0);
    }

    hideProcessingStatus() {
        document.getElementById('processingStatus').style.display = 'none';
        document.getElementById('selectedFiles').style.display = 'block';
    }

    updateProgress(percentage, message = null) {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
        
        if (message) {
            const statusDiv = document.getElementById('processingStatus');
            let messageElement = statusDiv.querySelector('.progress-message');
            if (!messageElement) {
                messageElement = document.createElement('p');
                messageElement.className = 'progress-message text-muted mt-2 mb-0';
                statusDiv.querySelector('.progress').parentNode.appendChild(messageElement);
            }
            messageElement.textContent = message;
        }
    }

    showResults(result) {
        this.currentJobId = result.job_id;
        
        document.getElementById('processingStatus').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        document.getElementById('results').classList.add('fade-in');
        
        document.getElementById('resultsMessage').textContent = result.message;
        
        // Create individual download buttons
        const individualDownloads = document.getElementById('individualDownloads');
        individualDownloads.innerHTML = `
            <h6 class="text-white mb-2">
                <i class="fas fa-file-download me-2"></i>
                Individual Downloads:
            </h6>
            <div class="d-flex flex-wrap gap-2">
                ${result.files.map(file => {
                    const displayName = file.display_name || file.original_name.replace('.pdf', '.docx');
                    return `
                    <button class="btn btn-light btn-sm" onclick="pdfExtractor.downloadFile('${file.word_file}', '${displayName}')">
                        <i class="fas fa-file-word me-1"></i>
                        ${displayName}
                    </button>
                    `;
                }).join('')}
            </div>
        `;
    }

    downloadFile(filename, displayName) {
        const link = document.createElement('a');
        link.href = `/download/${filename}`;
        link.download = displayName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification(`Downloading ${displayName}...`, 'success');
    }

    downloadAllFiles() {
        if (!this.currentJobId) return;
        
        const link = document.createElement('a');
        link.href = `/download_all/${this.currentJobId}`;
        link.download = `extracted_documents_${this.currentJobId}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Downloading all files as ZIP...', 'success');
    }

    resetInterface() {
        this.selectedFiles = [];
        this.currentJobId = null;
        
        document.getElementById('selectedFiles').style.display = 'none';
        document.getElementById('processingStatus').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        document.getElementById('fileInput').value = '';
        
        this.hideError();
        this.updateProgress(0);
    }

    showError(message) {
        const errorDisplay = document.getElementById('errorDisplay');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        errorDisplay.style.display = 'block';
        errorDisplay.classList.add('fade-in');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        document.getElementById('errorDisplay').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification fade-in`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    // Utility method to check processing status
    async checkStatus(jobId) {
        try {
            const response = await fetch(`/status/${jobId}`);
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error checking status:', error);
            return null;
        }
    }

    // Method to handle file validation
    validateFile(file) {
        const errors = [];
        
        if (file.type !== 'application/pdf') {
            errors.push('File must be a PDF');
        }
        
        if (file.size > 100 * 1024 * 1024) {
            errors.push('File size must be less than 100MB');
        }
        
        if (file.size === 0) {
            errors.push('File cannot be empty');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Method to estimate processing time
    estimateProcessingTime(fileCount, totalSize) {
        // Rough estimation: 30 seconds per file + 1 second per MB
        const baseTime = fileCount * 30;
        const sizeTime = (totalSize / (1024 * 1024)) * 1;
        return Math.max(baseTime + sizeTime, 10); // Minimum 10 seconds
    }

    // Method to show processing time estimate
    showProcessingEstimate() {
        if (this.selectedFiles.length === 0) return;
        
        const totalSize = this.selectedFiles.reduce((sum, file) => sum + file.size, 0);
        const estimatedTime = this.estimateProcessingTime(this.selectedFiles.length, totalSize);
        
        const minutes = Math.floor(estimatedTime / 60);
        const seconds = Math.floor(estimatedTime % 60);
        
        let timeText = '';
        if (minutes > 0) {
            timeText = `${minutes}m ${seconds}s`;
        } else {
            timeText = `${seconds}s`;
        }
        
        this.showNotification(`Estimated processing time: ${timeText}`, 'info');
    }
}

// Initialize the PDF extractor when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.pdfExtractor = new PDFExtractor();
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add loading overlay for better UX
    const body = document.body;
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <h4>Processing your files...</h4>
            <p>Please wait while we extract the red text from your PDFs.</p>
        </div>
    `;
    body.appendChild(loadingOverlay);
});

// Add some utility functions
window.utils = {
    // Format date for display
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Generate unique ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // Debounce function for performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Copy text to clipboard
    copyToClipboard: function(text) {
        navigator.clipboard.writeText(text).then(() => {
            window.pdfExtractor.showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            window.pdfExtractor.showNotification('Failed to copy to clipboard', 'error');
        });
    }
};