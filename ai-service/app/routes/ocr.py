import os
import uuid
import re
import cv2
import numpy as np
import pytesseract
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional
from app.config.settings import settings
from app.services.image.quality import analyze_image_quality
from app.services.image.resize import resize_image
from app.services.image.grayscale import to_grayscale
from app.services.image.denoise import denoise_image
from app.services.image.contrast import enhance_contrast
from app.services.image.threshold import apply_threshold
from app.services.image.deskew import deskew_image
from app.services.image.sharpen import sharpen_image
from app.services.ocr.tesseract import perform_ocr
from app.services.ocr.confidence import calculate_ocr_confidence
from app.services.ocr.text_cleanup import cleanup_ocr_text

router = APIRouter()

ALLOWED_URL_SCHEMES = ('https', 'http')
MAX_IMAGE_DIMENSION = 4000
MIN_IMAGE_DIMENSION = 100


class OCRRequest(BaseModel):
    image_url: str
    download: bool = True


def validate_url(url: str) -> bool:
    parsed = re.match(r'^https?://[^\s/$.?#].[^\s]*$', url)
    if not parsed:
        return False
    return any(url.startswith(s) for s in ALLOWED_URL_SCHEMES)


def validate_image_dimensions(image: np.ndarray) -> Optional[str]:
    h, w = image.shape[:2]
    if h < MIN_IMAGE_DIMENSION or w < MIN_IMAGE_DIMENSION:
        return f"Image too small: {w}x{h} (minimum {MIN_IMAGE_DIMENSION}x{MIN_IMAGE_DIMENSION})"
    if h > MAX_IMAGE_DIMENSION or w > MAX_IMAGE_DIMENSION:
        return f"Image too large: {w}x{h} (maximum {MAX_IMAGE_DIMENSION}x{MAX_IMAGE_DIMENSION})"
    return None


@router.post("/process")
async def process_ocr(request: OCRRequest):
    try:
        if not validate_url(request.image_url):
            raise HTTPException(status_code=400, detail="Invalid or insecure image URL")

        image_url = request.image_url
        if settings.image_host_override:
            from urllib.parse import urlparse, urlunparse
            parsed = urlparse(image_url)
            override = urlparse(settings.image_host_override)
            if parsed.netloc != override.netloc:
                image_url = urlunparse((override.scheme, override.netloc, parsed.path, parsed.params, parsed.query, parsed.fragment))

        import requests as req_lib
        try:
            response = req_lib.get(image_url, stream=True, timeout=30, allow_redirects=True)
        except req_lib.exceptions.Timeout:
            raise HTTPException(status_code=408, detail="Image download timed out")
        except req_lib.exceptions.RequestException:
            raise HTTPException(status_code=400, detail="Failed to download image")

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Could not download image")

        content_type = response.headers.get('content-type', '')
        if not content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="URL does not point to an image")

        contents = response.content
        max_size = settings.max_image_size_mb * 1024 * 1024
        if len(contents) > max_size:
            raise HTTPException(status_code=413, detail=f"Image exceeds maximum size of {settings.max_image_size_mb}MB")

        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Could not decode image")

        dim_error = validate_image_dimensions(image)
        if dim_error:
            raise HTTPException(status_code=400, detail=dim_error)

        quality_result = analyze_image_quality(image)

        processed = image.copy()
        processed = resize_image(processed)
        processed = deskew_image(processed)
        processed = to_grayscale(processed)
        processed = denoise_image(processed)
        processed = enhance_contrast(processed)
        processed = apply_threshold(processed)
        processed = sharpen_image(processed)

        if settings.tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = settings.tesseract_path

        raw_text, word_confidences = perform_ocr(processed)
        cleaned_text = cleanup_ocr_text(raw_text)
        confidence = calculate_ocr_confidence(word_confidences)

        os.makedirs(settings.upload_dir, exist_ok=True)
        filename = f"processed_{uuid.uuid4().hex}.png"
        output_path = os.path.join(settings.upload_dir, filename)
        cv2.imwrite(output_path, processed)

        return {
            "quality_score": quality_result["score"],
            "quality_issues": quality_result["issues"],
            "raw_text": raw_text,
            "cleaned_text": cleaned_text,
            "confidence": confidence,
            "processed_image_url": output_path,
            "word_count": len(cleaned_text.split()) if cleaned_text else 0,
        }
    except HTTPException:
        raise
    except Exception as e:
        msg = str(e).lower()
        if "tesseract" in msg or "tesseractnotfound" in msg:
            raise HTTPException(status_code=503, detail="Tesseract OCR not installed. Install Tesseract 5.x and ensure 'tesseract' is in PATH. Download at https://github.com/UB-Mannheim/tesseract/wiki or set TESSERACT_PATH in .env")
        raise HTTPException(status_code=500, detail=f"Internal processing error: {str(e)[:200]}")
