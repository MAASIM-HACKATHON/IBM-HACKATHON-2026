"""
Configuration for PDF Parser Microservice
"""
from pydantic_settings import BaseSettings
from typing import Optional, Union


class Settings(BaseSettings):
    """Application settings"""
    
    # Service Info
    SERVICE_NAME: str = "PDF Parser Microservice"
    SERVICE_VERSION: str = "1.0.0"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS Settings - can be comma-separated string or list
    CORS_ORIGINS: Union[list[str], str] = [
        "http://localhost:3001",  # Node.js server
        "http://localhost:5173",  # React client
        "http://localhost:3000",  # Alternative Node.js port
    ]
    
    # File Upload Limits
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Convert comma-separated string to list if needed
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()

# Made with Bob
