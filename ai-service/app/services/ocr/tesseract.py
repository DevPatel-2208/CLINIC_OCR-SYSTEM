import pytesseract


def perform_ocr(image, lang: str = "eng", config: str = "--oem 3 --psm 6") -> tuple:
    custom_config = f"-l {lang} {config}"
    raw_text = pytesseract.image_to_string(image, config=custom_config)
    data = pytesseract.image_to_data(image, config=custom_config, output_type=pytesseract.Output.DICT)
    confidences = []
    for i, word in enumerate(data["text"]):
        if word.strip():
            try:
                confidences.append(int(data["conf"][i]))
            except (ValueError, TypeError):
                pass
    return raw_text, confidences