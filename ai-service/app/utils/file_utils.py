import os
import uuid
from pathlib import Path


def ensure_dir(path: str) -> str:
    Path(path).mkdir(parents=True, exist_ok=True)
    return path


def generate_filename(extension: str = "png") -> str:
    return f"{uuid.uuid4().hex}.{extension}"


def get_file_size_mb(file_path: str) -> float:
    return os.path.getsize(file_path) / (1024 * 1024)