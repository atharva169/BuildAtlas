from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    gemini_api_key: str = ""
    cors_origins: str = "http://localhost:5173"
    log_level: str = "INFO"

    class Config:
        env_file = Path(__file__).parent / ".env"

settings = Settings()
