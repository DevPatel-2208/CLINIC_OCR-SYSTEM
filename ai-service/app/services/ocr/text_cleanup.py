import re


def cleanup_ocr_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s\.\,\-\/\#\(\)]', '', text)
    return text.strip()