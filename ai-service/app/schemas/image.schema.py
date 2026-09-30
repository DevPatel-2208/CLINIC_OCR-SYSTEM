from pydantic import BaseModel
from typing import Optional


class ImageQualityResult(BaseModel):
    score: int
    issues: list[str]
    processed: bool = False


class OCRResult(BaseModel):
    quality_score: int
    quality_issues: list[str]
    raw_text: str
    confidence: float
    processed_image_url: Optional[str] = None
    word_count: int = 0