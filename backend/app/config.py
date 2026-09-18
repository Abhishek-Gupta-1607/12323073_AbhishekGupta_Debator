import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "")
    AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
    AZURE_OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "")
    OPENAI_API_TYPE: str = os.getenv("OPENAI_API_TYPE", "openai")
    
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gpt-4o")
    JUDGE_MODEL_NAME: str = os.getenv("JUDGE_MODEL_NAME", "gpt-4o")
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./debator.db")

settings = Settings()
