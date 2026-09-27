"""Detection schemas matching YOLO output format."""
from pydantic import BaseModel
from typing import Optional


class BBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionOut(BaseModel):
    id: str  # det_001
    document_page_id: Optional[int] = None
    class_id: int
    class_name: str
    confidence: float
    bbox: BBox
    image_width: int
    image_height: int
    model_name: Optional[str] = None
    model_role: Optional[str] = None
    model_version: Optional[str] = None

    class Config:
        from_attributes = True


class DetectionResponse(BaseModel):
    document_id: int
    page: int
    model: str = "Two-Model-Ensemble (LandLayout + DocumentElements)"
    confidence_threshold: float
    detections: list[DetectionOut]
    models_status: Optional[dict[str, str]] = None
    fused_regions: Optional[list["RegionOut"]] = None


from datetime import datetime


class RegionOut(BaseModel):
    id: int
    detection_id: Optional[int] = None
    document_id: int
    page_number: int
    region_type: Optional[str] = "table"
    class_name: str
    source: str = "manual_selection"
    supporting_detection_ids: Optional[str] = None
    crop_path: str
    crop_url: str
    crop_width: Optional[int] = None
    crop_height: Optional[int] = None
    x1: Optional[float] = None
    y1: Optional[float] = None
    x2: Optional[float] = None
    y2: Optional[float] = None
    image_width: Optional[int] = None
    image_height: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ManualRegionRequest(BaseModel):
    page_number: int = 1
    x1: float
    y1: float
    x2: float
    y2: float
    image_width: int
    image_height: int
    region_type: str = "table"
