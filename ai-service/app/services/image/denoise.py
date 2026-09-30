import cv2
import numpy as np


def denoise_image(image: np.ndarray, strength: int = 10) -> np.ndarray:
    return cv2.fastNlMeansDenoising(image, None, strength, 7, 21)