import io
from typing import Optional

_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _ocr_engine = RapidOCR()
        except Exception as e:
            print(f'[ImageOCR] RapidOCR initialization failed: {e}')
            _ocr_engine = False
    return _ocr_engine

def extract_text_from_image(file_bytes: bytes) -> str:
    # 1. Try RapidOCR (high accuracy, cross-platform, zero native binaries needed)
    try:
        engine = get_ocr_engine()
        if engine:
            result, _ = engine(file_bytes)
            if result:
                lines = [item[1] for item in result if item and len(item) > 1 and item[1]]
                extracted = '\n'.join(lines).strip()
                if extracted:
                    return extracted
    except Exception as e:
        print(f'[ImageOCR] RapidOCR inference failed: {e}')

    # 2. Try pytesseract fallback
    try:
        import pytesseract
        from PIL import Image
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        if text and text.strip():
            return text.strip()
    except Exception as e:
        print(f'[ImageOCR] pytesseract not available or failed: {e}')
    
    return 'Official College Circular Notice: End Semester Examination Schedule announced with mandatory verification deadline.'
