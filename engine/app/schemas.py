"""Pydantic request/response models for the layout engine API."""

from typing import Literal

from pydantic import BaseModel, Field


class PhotoSizeInfo(BaseModel):
    name: str
    name_en: str
    width_mm: float
    height_mm: float
    width_px: int
    height_px: int


class PaperSizeInfo(BaseModel):
    name: str
    name_en: str
    width_mm: float
    height_mm: float
    width_px: int
    height_px: int


class LayoutOptions(BaseModel):
    background_color: str = Field(default="#FFFFFF")
    spacing_mm: float = Field(default=1.0, ge=0)
    margin_mm: float = Field(default=2.0, ge=0)
    cutting_guides: bool = Field(default=True)
    dpi: int = Field(default=300, ge=72, le=600)


class LayoutRequest(BaseModel):
    photo_size: str
    paper_size: str
    layout_mode: Literal["uniform", "mixed"] = "uniform"
    options: LayoutOptions = Field(default_factory=LayoutOptions)
    large_size: str | None = None
    small_size: str | None = None


class ZoneInfo(BaseModel):
    photo_size_key: str
    rows: int
    cols: int
    count: int


class LayoutResponse(BaseModel):
    layout_id: str
    preview_url: str
    zones: list[ZoneInfo]
    total_photos: int
    paper_width: int
    paper_height: int


class UploadResponse(BaseModel):
    photo_id: str
    thumbnail_url: str
    width: int
    height: int


class SizesResponse(BaseModel):
    photo_sizes: list[PhotoSizeInfo]
    paper_sizes: list[PaperSizeInfo]
