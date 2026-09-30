import cv2
import numpy as np


def analyze_image_quality(image: np.ndarray) -> dict:
    score = 100
    issues = []

    height, width = image.shape[:2]
    if height < 200 or width < 200:
        score -= 20
        issues.append("Low Resolution")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image

    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var < 100:
        score -= 20
        issues.append("Blur")
    elif laplacian_var < 200:
        score -= 10
        issues.append("Slightly Blurred")

    mean_brightness = np.mean(gray)
    if mean_brightness < 50:
        score -= 20
        issues.append("Low Lighting")
    elif mean_brightness > 200:
        score -= 10
        issues.append("Overexposed")

    if mean_brightness < 80:
        score -= 10
        issues.append("Poor Contrast")

    if abs(width - height) / max(width, height) > 0.8:
        score -= 5
        issues.append("Possible Cropping")

    angle = _detect_rotation(gray)
    if abs(angle) > 5:
        score -= 10
        issues.append("Rotation")
    elif abs(angle) > 2:
        score -= 5
        issues.append("Slight Rotation")

    score = max(0, min(100, score))

    return {"score": score, "issues": issues}


def _detect_rotation(gray: np.ndarray) -> float:
    _, bw = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(bw > 0))
    if len(coords) < 50:
        return 0.0
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = 90 + angle
    if angle > 45:
        angle = angle - 90
    return angle