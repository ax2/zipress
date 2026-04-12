"""Image helpers for ID photo preparation and export."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps

from app.config import DPI, PHOTO_SIZES

JPEG_MAGIC = b"\xff\xd8\xff"
PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


def detect_format_from_bytes(head: bytes) -> str | None:
    if head.startswith(JPEG_MAGIC):
        return "jpg"
    if head.startswith(PNG_MAGIC):
        return "png"
    return None


def extension_from_upload(filename: str | None, content_type: str | None) -> str | None:
    if filename:
        lower = filename.lower()
        if lower.endswith((".jpg", ".jpeg")):
            return "jpg"
        if lower.endswith(".png"):
            return "png"
    if content_type:
        ct = content_type.split(";")[0].strip().lower()
        if ct in ("image/jpeg", "image/jpg"):
            return "jpg"
        if ct == "image/png":
            return "png"
    return None


def validate_upload_bytes(data: bytes, filename: str | None, content_type: str | None) -> str:
    ext = extension_from_upload(filename, content_type)
    magic = detect_format_from_bytes(data[:16])
    if ext is None and magic:
        ext = magic
    if ext is None or magic is None or ext != magic:
        raise ValueError("Only JPEG or PNG uploads are allowed.")
    return ext


def load_rgba(path: Path) -> Image.Image:
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    return im.convert("RGBA")


def create_thumbnail_file(src_path: Path, dest_path: Path, max_edge: int = 320) -> tuple[int, int]:
    with Image.open(src_path) as im:
        im = ImageOps.exif_transpose(im)
        w, h = im.size
        rgb = im.convert("RGB")
        rgb.thumbnail((max_edge, max_edge), getattr(Image, "Resampling", Image).LANCZOS)
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        rgb.save(dest_path, format="JPEG", quality=85, optimize=True)
        return w, h


def image_to_lowres_jpeg_bytes(im: Image.Image, max_dim: int = 1200, quality: int = 78) -> bytes:
    rgb = im.convert("RGB")
    w, h = rgb.size
    if max(w, h) <= max_dim:
        out = rgb
    else:
        if w >= h:
            nw, nh = max_dim, max(1, round(h * max_dim / w))
        else:
            nh, nw = max_dim, max(1, round(w * max_dim / h))
        out = rgb.resize((nw, nh), getattr(Image, "Resampling", Image).LANCZOS)
    buf = BytesIO()
    out.save(buf, format="JPEG", quality=quality, optimize=True)
    return buf.getvalue()


def crop_to_ratio(img: Image.Image, target_width: int, target_height: int) -> Image.Image:
    src_w, src_h = img.size
    if src_w == 0 or src_h == 0:
        return img.copy()

    src_ratio = src_w / src_h
    target_ratio = target_width / target_height

    if src_ratio > target_ratio:
        new_w = int(round(src_h * target_ratio))
        new_w = max(1, min(new_w, src_w))
        left = (src_w - new_w) // 2
        return img.crop((left, 0, left + new_w, src_h))

    new_h = int(round(src_w / target_ratio))
    new_h = max(1, min(new_h, src_h))
    top = (src_h - new_h) // 2
    return img.crop((0, top, src_w, top + new_h))


def prepare_photo(img: Image.Image, photo_size_key: str) -> Image.Image:
    spec = PHOTO_SIZES[photo_size_key]
    tw, th = spec.width_px, spec.height_px
    cropped = crop_to_ratio(img, tw, th)
    resample = getattr(Image, "Resampling", Image).LANCZOS
    return cropped.resize((tw, th), resample)


def image_to_bytes(img: Image.Image, fmt: str = "JPEG", quality: int = 95) -> bytes:
    fmt_u = fmt.upper()
    buf = BytesIO()
    dpi_tuple = (DPI, DPI)

    if fmt_u == "JPEG":
        save_img = img
        if save_img.mode in ("RGBA", "LA"):
            base = Image.new("RGB", save_img.size, (255, 255, 255))
            base.paste(save_img, mask=save_img.split()[-1])
            save_img = base
        elif save_img.mode != "RGB":
            save_img = save_img.convert("RGB")
        save_img.save(buf, format="JPEG", quality=quality, dpi=dpi_tuple)
    elif fmt_u == "PNG":
        save_img = img
        if save_img.mode not in ("RGB", "RGBA"):
            save_img = save_img.convert("RGBA")
        save_img.save(buf, format="PNG", dpi=dpi_tuple)
    else:
        img.save(buf, format=fmt_u)

    return buf.getvalue()


def make_thumbnail(img: Image.Image, max_size: int = 400) -> Image.Image:
    thumb = img.copy()
    thumb.thumbnail((max_size, max_size), getattr(Image, "Resampling", Image).LANCZOS)
    return thumb

