# OCR Pipeline Documentation

## Overview

The OCR pipeline uses Python + FastAPI + OpenCV + Tesseract for image preprocessing and text extraction.

## Pipeline Flow

```
Uploaded Image (JPG/PNG)
    ↓
Image Quality Analysis
    ├── Resolution check
    ├── Blur detection (Laplacian variance)
    ├── Lighting analysis (mean brightness)
    ├── Contrast check
    ├── Cropping detection
    ├── Rotation detection
    └── Overall quality score (0-100)
    ↓
Quality Score ≥ 30?
    ├── Yes: Continue processing
    └── No: Return error, request better image
    ↓
OpenCV Preprocessing Pipeline
    ├── 1. Deskew (rotation correction)
    ├── 2. Grayscale conversion
    ├── 3. Noise reduction (fastNlMeansDenoising)
    ├── 4. Contrast enhancement (CLAHE)
    ├── 5. Adaptive thresholding
    └── 6. Sharpening
    ↓
Tesseract OCR
    ├── Language: English
    ├── OCR Engine Mode: 3 (LSTM + Legacy)
    ├── Page Segmentation: 6 (Assume uniform block)
    └── Output: Raw text + word confidences
    ↓
Confidence Calculation
    └── Average of all word confidence scores
    ↓
Return Results to Node.js
    ├── quality_score
    ├── quality_issues[]
    ├── raw_text
    ├── confidence
    └── processed_image_url
```

## Python Service Endpoints

### POST /preprocessing/process
Upload image for preprocessing only.

### POST /ocr/process
Full pipeline: quality check + preprocessing + OCR.

## Image Quality Thresholds

| Metric | Good | Fair | Poor |
|--------|------|------|------|
| Resolution | 2000+ px | 1000-2000 px | <1000 px |
| Blur (Laplacian var) | >200 | 100-200 | <100 |
| Brightness (mean) | 80-200 | 50-80 or 200+ | <50 |
| Rotation | <2° | 2-5° | >5° |

## Service Communication

Node.js → Python FastAPI via HTTP POST.
Python accepts image URL, downloads it, processes, returns results.

## File Locations

- Python service: `ai-service/`
- Quality check: `app/services/image/quality.py`
- Preprocessing modules: `app/services/image/*.py`
- OCR module: `app/services/ocr/tesseract.py`
- Confidence: `app/services/ocr/confidence.py`