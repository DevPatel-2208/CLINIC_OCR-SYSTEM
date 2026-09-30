from pydantic import BaseModel
from typing import Optional


class OCRInput(BaseModel):
    image_url: str
    download: bool = True


class OCRResponse(BaseModel):
    quality_score: int
    quality_issues: list[str]
    raw_text: str
    confidence: float
    processed_image_url: Optional[str] = None
    word_count: int = 0