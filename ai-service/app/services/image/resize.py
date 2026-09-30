import cv2
import numpy as np


def resize_image(image: np.ndarray, max_width: int = 2000, max_height: int = 2000) -> np.ndarray:
    h, w = image.shape[:2]
    if h > max_height or w > max_width:
        scale = min(max_width / w, max_height / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return image