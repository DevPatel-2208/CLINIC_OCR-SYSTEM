def calculate_ocr_confidence(confidences: list) -> float:
    if not confidences:
        return 0.0

    valid_confs = []
    for c in confidences:
        try:
            val = float(c)
        except (TypeError, ValueError):
            continue
        if val > 0:
            valid_confs.append(val)

    if not valid_confs:
        return 0.0

    return round(sum(valid_confs) / len(valid_confs), 2)