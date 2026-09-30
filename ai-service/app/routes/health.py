from fastapi import APIRouter
import shutil

router = APIRouter()


@router.get("/health")
def health_check():
    import cv2
    tesseract_available = shutil.which("tesseract") is not None
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        tesseract_available = True
    except Exception:
        tesseract_available = False
    return {"status": "healthy" if tesseract_available else "degraded", "service": "ai-service", "opencv": cv2.__version__, "tesseract_available": tesseract_available, "tesseract_path": shutil.which("tesseract")}


@router.get("/ping")
def ping():
    return {"message": "pong"}