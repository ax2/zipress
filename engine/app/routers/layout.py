"""HTTP routes for sizes, upload, layout generation, preview, and download."""

from __future__ import annotations

import uuid
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image

from app.config import PHOTO_SIZES, PAPER_SIZES, SizeDef
from app.schemas import (
    LayoutRequest,
    LayoutResponse,
    PhotoSizeInfo,
    PaperSizeInfo,
    SizesResponse,
    UploadResponse,
    ZoneInfo,
)
from app.services import image_utils, layout_engine

router = APIRouter()

ENGINE_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = ENGINE_ROOT / "uploads"
OUTPUT_DIR = ENGINE_ROOT / "outputs"


def ensure_storage_dirs() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def _photo_info(_key: str, definition: SizeDef) -> PhotoSizeInfo:
    return PhotoSizeInfo(
        name=definition.name,
        name_en=definition.name_en,
        width_mm=definition.width_mm,
        height_mm=definition.height_mm,
        width_px=definition.width_px,
        height_px=definition.height_px,
    )


def _paper_info(_key: str, definition: SizeDef) -> PaperSizeInfo:
    return PaperSizeInfo(
        name=definition.name,
        name_en=definition.name_en,
        width_mm=definition.width_mm,
        height_mm=definition.height_mm,
        width_px=definition.width_px,
        height_px=definition.height_px,
    )


@router.get("/sizes", response_model=SizesResponse)
def get_sizes() -> SizesResponse:
    photo_sizes = [_photo_info(k, v) for k, v in PHOTO_SIZES.items()]
    paper_sizes = [_paper_info(k, v) for k, v in PAPER_SIZES.items()]
    return SizesResponse(photo_sizes=photo_sizes, paper_sizes=paper_sizes)


@router.post("/upload", response_model=UploadResponse)
async def upload_photo(file: UploadFile = File(...)) -> UploadResponse:
    raw = await file.read()
    try:
        ext = image_utils.validate_upload_bytes(raw, file.filename, file.content_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    photo_id = str(uuid.uuid4())
    dest = UPLOAD_DIR / f"{photo_id}.{ext}"
    thumb = UPLOAD_DIR / f"{photo_id}_thumb.jpg"
    try:
        dest.write_bytes(raw)
        w, h = image_utils.create_thumbnail_file(dest, thumb)
    except OSError as e:
        raise HTTPException(status_code=500, detail="Failed to save upload.") from e
    except Exception as e:
        for p in (dest, thumb):
            if p.exists():
                p.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Failed to process image.") from e

    return UploadResponse(
        photo_id=photo_id,
        thumbnail_url=f"/uploads/{photo_id}_thumb.jpg",
        width=w,
        height=h,
    )


def _find_uploaded_photo(photo_id: str) -> Path | None:
    for ext in ("jpg", "png"):
        p = UPLOAD_DIR / f"{photo_id}.{ext}"
        if p.is_file():
            return p
    return None


@router.post("/layout", response_model=LayoutResponse)
def create_layout(
    body: LayoutRequest,
    photo_id: str = Query(..., description="Uploaded photo UUID"),
) -> LayoutResponse:
    src = _find_uploaded_photo(photo_id)
    if src is None:
        raise HTTPException(status_code=404, detail="Photo not found.")

    if body.layout_mode == "mixed" and (not body.large_size or not body.small_size):
        raise HTTPException(
            status_code=400,
            detail="mixed layout requires large_size and small_size.",
        )

    try:
        rgba = image_utils.load_rgba(src)
        rgb = rgba.convert("RGB")
    except OSError as e:
        raise HTTPException(status_code=400, detail="Could not read image file.") from e

    opt = body.options
    dpi = opt.dpi
    try:
        if body.layout_mode == "uniform":
            if body.photo_size not in PHOTO_SIZES:
                raise KeyError(f"Unknown photo size: {body.photo_size!r}")
            if body.paper_size not in PAPER_SIZES:
                raise KeyError(f"Unknown paper size: {body.paper_size!r}")
            layout = layout_engine.calculate_uniform_layout(
                body.photo_size,
                body.paper_size,
                spacing_mm=opt.spacing_mm,
                margin_mm=opt.margin_mm,
                dpi=dpi,
            )
            sheet = layout_engine.render_layout(
                rgb,
                layout,
                background_color=opt.background_color,
                cutting_guides=opt.cutting_guides,
            )
        else:
            layout = layout_engine.calculate_mixed_layout(
                body.large_size or "",
                body.small_size or "",
                body.paper_size,
                spacing_mm=opt.spacing_mm,
                margin_mm=opt.margin_mm,
                dpi=dpi,
            )
            photos = {
                body.large_size or "": rgb,
                body.small_size or "": rgb,
            }
            sheet = layout_engine.render_mixed_layout(
                photos,
                layout,
                background_color=opt.background_color,
                cutting_guides=opt.cutting_guides,
            )
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    layout_id = str(uuid.uuid4())
    out_path = OUTPUT_DIR / f"{layout_id}.jpg"
    try:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(out_path, format="JPEG", quality=95, optimize=True)
    except OSError as e:
        raise HTTPException(status_code=500, detail="Failed to write layout output.") from e

    zones = [
        ZoneInfo(
            photo_size_key=z.photo_size_key,
            rows=z.rows,
            cols=z.cols,
            count=len(z.positions),
        )
        for z in layout.zones
    ]
    return LayoutResponse(
        layout_id=layout_id,
        preview_url=f"/preview/{layout_id}",
        zones=zones,
        total_photos=layout.total_photos,
        paper_width=layout.paper_width,
        paper_height=layout.paper_height,
    )


@router.get("/preview/{layout_id}")
def preview_layout(layout_id: str) -> StreamingResponse:
    path = OUTPUT_DIR / f"{layout_id}.jpg"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Layout not found.")
    try:
        with Image.open(path) as im:
            data = image_utils.image_to_lowres_jpeg_bytes(
                im,
                max_dim=1200,
                quality=78,
            )
    except OSError as e:
        raise HTTPException(status_code=500, detail="Failed to read layout.") from e

    return StreamingResponse(
        BytesIO(data),
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.get("/download/{layout_id}")
def download_layout(layout_id: str) -> FileResponse:
    path = OUTPUT_DIR / f"{layout_id}.jpg"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Layout not found.")
    return FileResponse(
        path,
        media_type="image/jpeg",
        filename=f"layout_{layout_id}.jpg",
        content_disposition_type="attachment",
    )
