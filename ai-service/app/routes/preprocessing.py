import os
import uuid
import cv2
import numpy as np
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services.image.quality import analyze_image_quality
from app.services.image.resize import resize_image
from app.services.image.grayscale import to_grayscale
from app.services.image.denoise import denoise_image
from app.services.image.contrast import enhance_contrast
from app.services.image.threshold import apply_threshold
from app.services.image.deskew import deskew_image
from app.services.image.sharpen import sharpen_image
from app.config.settings import settings

router = APIRouter()

MIN_IMAGE_DIMENSION = 100
MAX_IMAGE_DIMENSION = 4000


def validate_image_dimensions(image: np.ndarray) -> bool:
    h, w = image.shape[:2]
    return MIN_IMAGE_DIMENSION <= h <= MAX_IMAGE_DIMENSION and MIN_IMAGE_DIMENSION <= w <= MAX_IMAGE_DIMENSION


@router.post("/process")
async def preprocess_image(file: UploadFile = File(...)):
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")

        max_size = settings.max_image_size_mb * 1024 * 1024
        contents = await file.read()
        if len(contents) > max_size:
            raise HTTPException(status_code=413, detail=f"File exceeds maximum size of {settings.max_image_size_mb}MB")

        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        if not validate_image_dimensions(image):
            raise HTTPException(status_code=400, detail="Image dimensions out of acceptable range")

        quality_result = analyze_image_quality(image)

        if quality_result["score"] < 30:
            return {
                "quality_score": quality_result["score"],
                "quality_issues": quality_result["issues"],
                "message": "Image quality too low for processing",
                "processed": False,
            }

        processed = image.copy()
        processed = resize_image(processed)
        processed = deskew_image(processed)
        processed = to_grayscale(processed)
        processed = denoise_image(processed)
        processed = enhance_contrast(processed)
        processed = apply_threshold(processed)
        processed = sharpen_image(processed)

        os.makedirs(settings.upload_dir, exist_ok=True)
        filename = f"{uuid.uuid4()}.png"
        output_path = os.path.join(settings.upload_dir, filename)
        cv2.imwrite(output_path, processed)

        return {
            "quality_score": quality_result["score"],
            "quality_issues": quality_result["issues"],
            "processed_image_path": output_path,
            "processed": True,
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Internal processing error")
