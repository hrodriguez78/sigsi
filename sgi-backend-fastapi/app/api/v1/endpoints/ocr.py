from fastapi import APIRouter, UploadFile, File, Query, Depends, HTTPException

from app.api.v1.endpoints.auth import get_current_user
from app.services.ocr import extract_text_from_image, extract_text_from_pdf

router = APIRouter(prefix="/ocr", tags=["OCR"])


@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    language: str = Query("spa+eng", description="Idioma Tesseract (ej: spa+eng, eng)"),
    current_user: dict = Depends(get_current_user),
):
    allowed_types = {
        "image/png": "image",
        "image/jpeg": "image",
        "image/jpg": "image",
        "image/tiff": "image",
        "image/bmp": "image",
        "image/webp": "image",
        "application/pdf": "pdf",
    }

    content_type = file.content_type or ""
    file_type = allowed_types.get(content_type)

    if not file_type:
        ext = (file.filename or "").lower().rsplit(".", 1)[-1] if "." in (file.filename or "") else ""
        if ext in ("png", "jpg", "jpeg", "tiff", "bmp", "webp"):
            file_type = "image"
        elif ext == "pdf":
            file_type = "pdf"

    if not file_type:
        raise HTTPException(
            status_code=400,
            detail="Formato no soportado. Use imágenes (PNG, JPG, TIFF, BMP, WebP) o PDF."
        )

    if file_type == "image":
        result = await extract_text_from_image(file, language)
    else:
        result = await extract_text_from_pdf(file, language)

    return result
