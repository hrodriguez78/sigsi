import io
import os
import tempfile
from typing import Optional

from fastapi import UploadFile, HTTPException


async def extract_text_from_image(file: UploadFile, language: str = "spa+eng") -> dict:
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="pytesseract o Pillow no están instalados. Instale tesseract-ocr en el sistema."
        )

    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo excede 20MB")

    try:
        img = Image.open(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo abrir la imagen")

    try:
        text = pytesseract.image_to_string(img, lang=language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error OCR: {str(e)}")

    try:
        data = pytesseract.image_to_data(img, lang=language, output_type=pytesseract.Output.DICT)
        word_count = len([w for w in data.get("text", []) if w.strip()])
    except Exception:
        word_count = len(text.split())

    return {
        "text": text.strip(),
        "word_count": word_count,
        "language": language,
        "image_size": f"{img.width}x{img.height}",
        "filename": file.filename,
    }


async def extract_text_from_pdf(file: UploadFile, language: str = "spa+eng") -> dict:
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="pytesseract o Pillow no están instalados."
        )

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Archivo excede 50MB")

    try:
        from pdf2image import convert_from_bytes
        images = convert_from_bytes(content, dpi=300)
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="pdf2image no está instalado. Instale poppler-utils en el sistema."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al procesar PDF: {str(e)}")

    all_text = []
    total_words = 0
    for i, img in enumerate(images):
        try:
            page_text = pytesseract.image_to_string(img, lang=language)
            all_text.append(f"--- Página {i + 1} ---\n{page_text.strip()}")
            data = pytesseract.image_to_data(img, lang=language, output_type=pytesseract.Output.DICT)
            total_words += len([w for w in data.get("text", []) if w.strip()])
        except Exception:
            all_text.append(f"--- Página {i + 1} ---\n[Error al procesar]")

    return {
        "text": "\n\n".join(all_text),
        "word_count": total_words,
        "pages": len(images),
        "language": language,
        "filename": file.filename,
    }
