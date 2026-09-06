"""
Preprocessing service — minimal normalization for document images.

IMPORTANT: The trained YOLO model was trained on normal document images.
Do NOT apply aggressive thresholding, heavy denoising, or binary conversion.
Default inference uses the original page image.
"""
import logging
from PIL import Image

logger = logging.getLogger(__name__)


def preprocess_for_detection(image_path: str) -> str:
    """
    Minimal preprocessing for YOLO detection.
    Currently returns the original image path — the trained model
    expects normal document images.

    Args:
        image_path: Path to the page image.

    Returns:
        Path to the (possibly preprocessed) image.
    """
    # The model was trained on normal document images.
    # No aggressive preprocessing needed.
    return image_path


def crop_region(
    image_path: str,
    x1: float, y1: float, x2: float, y2: float,
    output_path: str,
    padding: int = 8,
) -> tuple[int, int]:
    """
    Crop a detected region from the image with small padding.

    Returns:
        (crop_width, crop_height)
    """
    img = Image.open(image_path)
    w, h = img.size

    # Apply padding within bounds
    crop_x1 = max(0, int(x1) - padding)
    crop_y1 = max(0, int(y1) - padding)
    crop_x2 = min(w, int(x2) + padding)
    crop_y2 = min(h, int(y2) + padding)

    cropped = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
    cropped.save(output_path)

    logger.info(f"Cropped region [{crop_x1},{crop_y1},{crop_x2},{crop_y2}] → {output_path}")
    return cropped.size
