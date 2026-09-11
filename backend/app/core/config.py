import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "LegalAI Contract Reviewer"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    
    # LLM Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Storage & DB
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@localhost:5432/legal_ai_db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "legalpassword123")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
