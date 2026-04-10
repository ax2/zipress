"""ID photo sheet layout: grid calculation and composite rendering."""

from __future__ import annotations

from dataclasses import dataclass

from PIL import Image

from app.config import (
    DEFAULT_MARGIN_MM,
    DEFAULT_SPACING_MM,
    DPI,
    PAPER_SIZES,
    PHOTO_SIZES,
    SizeDef,
    mm_to_px_at,
)


def _dims_at_dpi(definition: SizeDef, dpi: int) -> tuple[int, int]:
    return mm_to_px_at(definition.width_mm, dpi), mm_to_px_at(definition.height_mm, dpi)


@dataclass(frozen=True)
class CellPosition:
    x: int
    y: int
    width: int
    height: int


@dataclass(frozen=True)
class LayoutZone:
    photo_size_key: str
    rows: int
    cols: int
    cell_width: int
    cell_height: int
    positions: list[CellPosition]


@dataclass(frozen=True)
class LayoutResult:
    paper_width: int
    paper_height: int
    zones: list[LayoutZone]
    total_photos: int


def _fit_grid(
    key: str,
    pw: int,
    ph: int,
    paper_w: int,
    paper_h: int,
    spacing: int,
    margin: int,
    offset_y: int = 0,
) -> LayoutZone:
    usable_w = paper_w - 2 * margin
    usable_h = paper_h - 2 * margin
    if usable_w < pw or usable_h < ph:
        return LayoutZone(
            photo_size_key=key,
            rows=0,
            cols=0,
            cell_width=pw,
            cell_height=ph,
            positions=[],
        )

    cols = (usable_w + spacing) // (pw + spacing)
    rows = (usable_h + spacing) // (ph + spacing)
    cols = max(cols, 0)
    rows = max(rows, 0)

    if rows == 0 or cols == 0:
        return LayoutZone(
            photo_size_key=key,
            rows=0,
            cols=0,
            cell_width=pw,
            cell_height=ph,
            positions=[],
        )

    total_grid_w = cols * pw + (cols - 1) * spacing
    total_grid_h = rows * ph + (rows - 1) * spacing
    start_x = margin + (usable_w - total_grid_w) // 2
    start_y = margin + (usable_h - total_grid_h) // 2 + offset_y

    positions: list[CellPosition] = []
    for r in range(rows):
        for c in range(cols):
            x = start_x + c * (pw + spacing)
            y = start_y + r * (ph + spacing)
            positions.append(CellPosition(x=x, y=y, width=pw, height=ph))

    return LayoutZone(
        photo_size_key=key,
        rows=rows,
        cols=cols,
        cell_width=pw,
        cell_height=ph,
        positions=positions,
    )


def _fit_grid_in_area(
    key: str,
    pw: int,
    ph: int,
    paper_w: int,
    area_h: int,
    spacing: int,
    margin: int,
    area_top: int,
) -> LayoutZone:
    usable_w = paper_w - 2 * margin
    usable_h = area_h
    if usable_w < pw or usable_h < ph:
        return LayoutZone(
            photo_size_key=key,
            rows=0,
            cols=0,
            cell_width=pw,
            cell_height=ph,
            positions=[],
        )

    cols = (usable_w + spacing) // (pw + spacing)
    rows = (usable_h + spacing) // (ph + spacing)
    cols = max(cols, 0)
    rows = max(rows, 0)

    if rows == 0 or cols == 0:
        return LayoutZone(
            photo_size_key=key,
            rows=0,
            cols=0,
            cell_width=pw,
            cell_height=ph,
            positions=[],
        )

    total_grid_w = cols * pw + (cols - 1) * spacing
    total_grid_h = rows * ph + (rows - 1) * spacing
    start_x = margin + (usable_w - total_grid_w) // 2
    start_y = area_top + (usable_h - total_grid_h) // 2

    positions: list[CellPosition] = []
    for r in range(rows):
        for c in range(cols):
            x = start_x + c * (pw + spacing)
            y = start_y + r * (ph + spacing)
            positions.append(CellPosition(x=x, y=y, width=pw, height=ph))

    return LayoutZone(
        photo_size_key=key,
        rows=rows,
        cols=cols,
        cell_width=pw,
        cell_height=ph,
        positions=positions,
    )


def calculate_uniform_layout(
    photo_size_key: str,
    paper_size_key: str,
    spacing_mm: float = DEFAULT_SPACING_MM,
    margin_mm: float = DEFAULT_MARGIN_MM,
    dpi: int | None = None,
) -> LayoutResult:
    use_dpi = DPI if dpi is None else dpi
    photo = PHOTO_SIZES[photo_size_key]
    paper = PAPER_SIZES[paper_size_key]
    pw, ph = _dims_at_dpi(photo, use_dpi)
    paper_w, paper_h = _dims_at_dpi(paper, use_dpi)
    spacing = mm_to_px_at(spacing_mm, use_dpi)
    margin = mm_to_px_at(margin_mm, use_dpi)

    zone = _fit_grid(photo_size_key, pw, ph, paper_w, paper_h, spacing, margin, 0)
    total = len(zone.positions)
    return LayoutResult(
        paper_width=paper_w,
        paper_height=paper_h,
        zones=[zone],
        total_photos=total,
    )


def calculate_mixed_layout(
    large_size_key: str,
    small_size_key: str,
    paper_size_key: str,
    spacing_mm: float = DEFAULT_SPACING_MM,
    margin_mm: float = DEFAULT_MARGIN_MM,
    dpi: int | None = None,
) -> LayoutResult:
    use_dpi = DPI if dpi is None else dpi
    large = PHOTO_SIZES[large_size_key]
    small = PHOTO_SIZES[small_size_key]
    paper = PAPER_SIZES[paper_size_key]
    paper_w, paper_h = _dims_at_dpi(paper, use_dpi)
    spacing = mm_to_px_at(spacing_mm, use_dpi)
    margin = mm_to_px_at(margin_mm, use_dpi)

    split_y = paper_h // 2
    area_h_large = split_y - spacing // 2 - margin
    area_top_large = margin
    area_top_small = split_y + spacing // 2
    area_h_small = paper_h - margin - area_top_small

    lw, lh = _dims_at_dpi(large, use_dpi)
    sw, sh = _dims_at_dpi(small, use_dpi)
    zone_large = _fit_grid_in_area(
        large_size_key,
        lw,
        lh,
        paper_w,
        max(area_h_large, 0),
        spacing,
        margin,
        area_top_large,
    )
    zone_small = _fit_grid_in_area(
        small_size_key,
        sw,
        sh,
        paper_w,
        max(area_h_small, 0),
        spacing,
        margin,
        area_top_small,
    )

    zones = [zone_large, zone_small]
    total = sum(len(z.positions) for z in zones)
    return LayoutResult(
        paper_width=paper_w,
        paper_height=paper_h,
        zones=zones,
        total_photos=total,
    )


def _resize_to_cell(photo: Image.Image, w: int, h: int) -> Image.Image:
    resample = getattr(Image, "Resampling", Image).LANCZOS
    return photo.resize((w, h), resample)


def render_layout(
    photo: Image.Image,
    layout: LayoutResult,
    background_color: str = "#FFFFFF",
    cutting_guides: bool = True,
) -> Image.Image:
    canvas = Image.new(
        "RGB",
        (layout.paper_width, layout.paper_height),
        background_color,
    )
    for zone in layout.zones:
        for pos in zone.positions:
            cell = _resize_to_cell(photo, pos.width, pos.height)
            if cell.mode != "RGB":
                cell = cell.convert("RGB")
            canvas.paste(cell, (pos.x, pos.y))

    if cutting_guides:
        from app.services.guide_drawer import draw_cutting_guides

        draw_cutting_guides(canvas, layout)

    return canvas


def render_mixed_layout(
    photos: dict[str, Image.Image],
    layout: LayoutResult,
    background_color: str = "#FFFFFF",
    cutting_guides: bool = True,
) -> Image.Image:
    canvas = Image.new(
        "RGB",
        (layout.paper_width, layout.paper_height),
        background_color,
    )
    for zone in layout.zones:
        src = photos[zone.photo_size_key]
        for pos in zone.positions:
            cell = _resize_to_cell(src, pos.width, pos.height)
            if cell.mode != "RGB":
                cell = cell.convert("RGB")
            canvas.paste(cell, (pos.x, pos.y))

    if cutting_guides:
        from app.services.guide_drawer import draw_cutting_guides

        draw_cutting_guides(canvas, layout)

    return canvas
