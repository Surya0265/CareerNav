"""
Configuration helper for CareerNav backend
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Application configuration"""
    
    # Flask settings
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Gemini AI settings
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    
    # Upload settings
    UPLOAD_FOLDER = './uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc'}
    
    @staticmethod
    def validate_config():
        """Validate that required configuration is present"""
        issues = []
        
        if not Config.GEMINI_API_KEY:
            issues.append("GEMINI_API_KEY not found in environment variables")
        
        return issues

def get_config():
    """Get configuration object"""
    return Config()

def check_config():
    """Check configuration and print status"""
    config = get_config()
    issues = config.validate_config()
    
    if issues:
        print("Configuration Issues:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print("Configuration is valid")
        return True
