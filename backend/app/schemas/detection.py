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
    class_id: int
    class_name: str
    confidence: float
    bbox: BBox
    image_width: int
    image_height: int

    class Config:
        from_attributes = True


class DetectionResponse(BaseModel):
    document_id: int
    page: int
    model: str = "YOLOv8n-layout-detector"
    confidence_threshold: float
    detections: list[DetectionOut]


class RegionOut(BaseModel):
    id: int
    detection_id: int
    document_id: int
    page_number: int
    class_name: str
    crop_path: str
    crop_url: str
    crop_width: Optional[int] = None
    crop_height: Optional[int] = None

    class Config:
        from_attributes = True
