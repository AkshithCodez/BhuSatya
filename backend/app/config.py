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

    # Persistent Storage Root (Mount Railway Volume to /data, local default is .)
    STORAGE_ROOT: str = "."

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    FRONTEND_ORIGIN: str = ""
    CORS_ORIGINS: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @property
    def STORAGE_DIR(self) -> str:
        return str(Path(self.STORAGE_ROOT) / "storage")

    @property
    def UPLOAD_DIR(self) -> str:
        return str(Path(self.STORAGE_ROOT) / "uploads")

    @property
    def DOCUMENT_PAGES_DIR(self) -> str:
        return str(Path(self.STORAGE_ROOT) / "document_pages")

    @property
    def DETECTED_REGIONS_DIR(self) -> str:
        return str(Path(self.STORAGE_ROOT) / "detected_regions")

    @property
    def allowed_cors_origins(self) -> list[str]:
        origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"}
        if self.FRONTEND_URL:
            origins.add(self.FRONTEND_URL.rstrip("/"))
        if self.FRONTEND_ORIGIN:
            origins.add(self.FRONTEND_ORIGIN.rstrip("/"))
        if self.CORS_ORIGINS:
            for o in self.CORS_ORIGINS.split(","):
                o_clean = o.strip().rstrip("/")
                if o_clean:
                    origins.add(o_clean)
        return list(origins)

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
