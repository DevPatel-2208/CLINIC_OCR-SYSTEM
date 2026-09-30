import cv2
import numpy as np


def apply_threshold(image: np.ndarray, method: str = "adaptive") -> np.ndarray:
    if method == "adaptive":
        return cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                     cv2.THRESH_BINARY, 11, 2)
    elif method == "otsu":
        _, thresh = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh
    return image