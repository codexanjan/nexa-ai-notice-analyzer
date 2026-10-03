try:
    import pymupdf as fitz
except ImportError:
    import fitz  # PyMuPDF fallback
from typing import Optional

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts high-fidelity text from PDF using PyMuPDF.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text("text")
            if page_text and page_text.strip():
                text_parts.append(page_text.strip())
        
        extracted_text = "\n\n".join(text_parts).strip()
        doc.close()
        return extracted_text
    except Exception as e:
        print(f"[PDFParser] Error parsing PDF: {e}")
        return ""
