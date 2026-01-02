# Production Configuration
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    OUTPUT_FOLDER = os.environ.get('OUTPUT_FOLDER') or 'output'
    MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 100 * 1024 * 1024))  # 100MB
    
    # File cleanup settings
    CLEANUP_INTERVAL = int(os.environ.get('CLEANUP_INTERVAL', 3600))  # 1 hour
    MAX_FILE_AGE = int(os.environ.get('MAX_FILE_AGE', 86400))  # 24 hours
    
    # Processing settings
    MAX_CONCURRENT_JOBS = int(os.environ.get('MAX_CONCURRENT_JOBS', 5))
    PROCESSING_TIMEOUT = int(os.environ.get('PROCESSING_TIMEOUT', 300))  # 5 minutes

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    TESTING = True
    DEBUG = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}