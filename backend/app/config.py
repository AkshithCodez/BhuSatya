"""Application configuration via environment variables."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "BhuSatya"
    DEMO_MODE: bool = False
    SECRET_KEY: str = "CHANGE_THIS_TO_A_RANDOM_SECRET_KEY"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    TESTING: bool = False

    # Database — PostgreSQL default with psycopg 3
    DATABASE_URL: str = "postgresql+psycopg://bhusatya:password@localhost:5432/bhusatya"

    # ML Model 1 - Land Layout Detection (Model A)
    LAND_LAYOUT_MODEL_PATH: str = "./ml_models/land_layout_detector.pt"
    LAND_LAYOUT_CONFIDENCE: float = 0.35

    # ML Model 2 - Document Elements: Table / Signature / Stamp (Model B)
    DOCUMENT_ELEMENT_MODEL_PATH: str = "./ml_models/table_signature_stamp_detector.pt"
    DOCUMENT_ELEMENT_CONFIDENCE: float = 0.35

    # Fusion Settings
    TABLE_DEDUP_IOU_THRESHOLD: float = 0.70

    # Backwards compatibility aliases
    LAYOUT_MODEL_PATH: str = "./ml_models/land_layout_detector.pt"
    LAYOUT_MODEL_CONFIDENCE: float = 0.35

    # ML Model 3 - Table Text Extraction (paddle_ocr | manual | custom)
    TABLE_TEXT_PROVIDER: str = "paddle_ocr"

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
    def land_layout_available(self) -> bool:
        return Path(self.LAND_LAYOUT_MODEL_PATH).exists()

    @property
    def document_element_available(self) -> bool:
        return Path(self.DOCUMENT_ELEMENT_MODEL_PATH).exists()

    @property
    def model_available(self) -> bool:
        return self.land_layout_available or self.document_element_available


settings = Settings()
