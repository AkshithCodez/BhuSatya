"""Application configuration via environment variables."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "BhuSatya"
    DEMO_MODE: bool = True
    SECRET_KEY: str = "CHANGE_THIS_TO_A_RANDOM_SECRET_KEY"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Database — PostgreSQL default with psycopg 3
    DATABASE_URL: str = "postgresql+psycopg://bhusatya:password@localhost:5432/bhusatya"

    # ML Model 1 - Layout Detection
    LAYOUT_MODEL_PATH: str = "./ml_models/layout_detector.pt"
    LAYOUT_MODEL_CONFIDENCE: float = 0.35

    # ML Model 2 - Table Text Extraction (mock | manual | ocr | paddle_ocr | custom)
    TABLE_TEXT_PROVIDER: str = "mock"

    # File Storage
    STORAGE_DIR: str = "./storage"
    UPLOAD_DIR: str = "./uploads"
    DOCUMENT_PAGES_DIR: str = "./document_pages"
    DETECTED_REGIONS_DIR: str = "./detected_regions"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def model_available(self) -> bool:
        return Path(self.LAYOUT_MODEL_PATH).exists()


settings = Settings()
