import cv2
import numpy as np


def sharpen_image(image: np.ndarray, strength: float = 1.0) -> np.ndarray:
    kernel = np.array([
        [0, -strength, 0],
        [-strength, 1 + 4 * strength, -strength],
        [0, -strength, 0]
    ])
    return cv2.filter2D(image, -1, kernel)