import numpy as np
import cv2
from app.services.image.quality import analyze_image_quality
from app.services.image.resize import resize_image
from app.services.image.grayscale import to_grayscale
from app.services.image.denoise import denoise_image
from app.services.image.contrast import enhance_contrast
from app.services.image.threshold import apply_threshold
from app.services.image.deskew import deskew_image
from app.services.image.sharpen import sharpen_image

def make_image(h=400, w=400, color=200):
    img = np.full((h, w, 3), color, dtype=np.uint8)
    cv2.putText(img, "Amoxicillin 500mg", (20, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0,0,0), 2)
    return img

def test_quality_returns_score():
    img = make_image()
    r = analyze_image_quality(img)
    assert 0 <= r["score"] <= 100
    assert isinstance(r["issues"], list)

def test_blur_detection():
    img = make_image()
    blur = cv2.GaussianBlur(img, (21,21), 0)
    r = analyze_image_quality(blur)
    assert "Blur" in r["issues"] or "Slightly Blurred" in r["issues"]

def test_resize():
    img = make_image(3000, 3000)
    out = resize_image(img)
    assert max(out.shape[:2]) <= 2000

def test_grayscale():
    img = make_image()
    g = to_grayscale(img)
    assert len(g.shape) == 2

def test_pipeline_order():
    img = make_image()
    p = resize_image(img)
    p = deskew_image(p)
    p = to_grayscale(p)
    p = denoise_image(p)
    p = enhance_contrast(p)
    p = apply_threshold(p)
    p = sharpen_image(p)
    assert p is not None
    assert len(p.shape) == 2
