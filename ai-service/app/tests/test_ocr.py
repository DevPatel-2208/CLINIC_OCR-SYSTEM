import numpy as np
import cv2
from app.services.ocr.confidence import calculate_ocr_confidence
from app.services.ocr.text_cleanup import cleanup_ocr_text

def test_confidence_empty():
    assert calculate_ocr_confidence([]) == 0

def test_confidence_average():
    assert calculate_ocr_confidence([90, 80, 70]) == 80

def test_confidence_filters_invalid():
    assert calculate_ocr_confidence([90, -1, 101, 80]) == 85

def test_cleanup_trims():
    assert cleanup_ocr_text("  hello   world  ") == "hello world"

def test_cleanup_removes_special():
    s = cleanup_ocr_text("Amo@#xicillin$%^")
    assert "Amoxicillin" in s

def test_raw_preservation():
    from app.services.ocr.tesseract import perform_ocr
    img = np.full((100, 300), 255, dtype=np.uint8)
    cv2.putText(img, "Test", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,0), 2)
    raw, conf = perform_ocr(img)
    assert isinstance(raw, str)
    assert isinstance(conf, list)
