"""Crop service for extracted regions with boundary safety."""
import logging
import os
from pathlib import Path
from PIL import Image

from app.services.layout_detection.schemas import BBox

logger = logging.getLogger(__name__)


def crop_image_region(
    image_path: str,
    bbox: BBox,
    output_path: str,
    padding: int = 4,
) -> tuple[int, int]:
    """
    Safely crop a bounding box region from an image, clamping coordinates and adding small padding.

    Args:
        image_path: Path to source image.
        bbox: Bounding box with x1, y1, x2, y2.
        output_path: Target path for the cropped PNG image.
        padding: Padding in pixels.

    Returns:
        (crop_width, crop_height) in pixels.
    """
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Source image not found: {image_path}")

    with Image.open(image_path) as img:
        img_w, img_h = img.size

        # Clamp with padding
        crop_x1 = max(0, int(bbox.x1) - padding)
        crop_y1 = max(0, int(bbox.y1) - padding)
        crop_x2 = min(img_w, int(bbox.x2) + padding)
        crop_y2 = min(img_h, int(bbox.y2) + padding)

        if crop_x1 >= crop_x2:
            crop_x2 = min(img_w, crop_x1 + 1)
        if crop_y1 >= crop_y2:
            crop_y2 = min(img_h, crop_y1 + 1)

        cropped = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))

        # Ensure target directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cropped.save(output_path)

        logger.info(
            f"Cropped region [{crop_x1},{crop_y1},{crop_x2},{crop_y2}] ({cropped.size[0]}x{cropped.size[1]}px) → {output_path}"
        )
        return cropped.size
