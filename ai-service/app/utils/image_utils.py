import cv2
import numpy as np
from PIL import Image


def load_image_from_bytes(data: bytes) -> np.ndarray:
    nparr = np.frombuffer(data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


def load_image_from_path(path: str) -> np.ndarray:
    return cv2.imread(path)


def image_to_bytes(image: np.ndarray, ext: str = ".png") -> bytes:
    _, encoded = cv2.imencode(ext, image)
    return encoded.tobytes()