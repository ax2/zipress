"""Dashed cutting guide marks for ID photo sheets."""

from __future__ import annotations

from PIL import Image, ImageDraw

from app.services.layout_engine import LayoutResult

GUIDE_COLOR = (180, 180, 180)
GUIDE_DASH = (6, 4)
GUIDE_EXTEND = 8


def _dashed_line(
    draw: ImageDraw.ImageDraw,
    x0: int,
    y0: int,
    x1: int,
    y1: int,
) -> None:
    if y0 == y1:
        x_lo, x_hi = (x0, x1) if x0 <= x1 else (x1, x0)
        x = x_lo
        dash_on, dash_off = GUIDE_DASH
        while x < x_hi:
            seg_end = min(x + dash_on, x_hi)
            draw.line((x, y0, seg_end, y0), fill=GUIDE_COLOR, width=1)
            x = seg_end + dash_off
    elif x0 == x1:
        y_lo, y_hi = (y0, y1) if y0 <= y1 else (y1, y0)
        y = y_lo
        dash_on, dash_off = GUIDE_DASH
        while y < y_hi:
            seg_end = min(y + dash_on, y_hi)
            draw.line((x0, y, x0, seg_end), fill=GUIDE_COLOR, width=1)
            y = seg_end + dash_off
    else:
        raise ValueError("_dashed_line only supports horizontal or vertical segments")


def _draw_corner_marks(
    draw: ImageDraw.ImageDraw,
    x: int,
    y: int,
    w: int,
    h: int,
    mark_len: int = 12,
) -> None:
    ext = GUIDE_EXTEND
    # Top-left: outward left and up
    _dashed_line(draw, x - ext - mark_len, y, x - ext, y)
    _dashed_line(draw, x, y - ext - mark_len, x, y - ext)
    # Top-right: outward right and up
    _dashed_line(draw, x + w + ext, y, x + w + ext + mark_len, y)
    _dashed_line(draw, x + w, y - ext - mark_len, x + w, y - ext)
    # Bottom-left: outward left and down
    _dashed_line(draw, x - ext - mark_len, y + h, x - ext, y + h)
    _dashed_line(draw, x, y + h + ext, x, y + h + ext + mark_len)
    # Bottom-right: outward right and down
    _dashed_line(draw, x + w + ext, y + h, x + w + ext + mark_len, y + h)
    _dashed_line(draw, x + w, y + h + ext, x + w, y + h + ext + mark_len)


def draw_cutting_guides(canvas: Image.Image, layout: LayoutResult) -> None:
    draw = ImageDraw.Draw(canvas)
    for zone in layout.zones:
        for pos in zone.positions:
            _draw_corner_marks(draw, pos.x, pos.y, pos.width, pos.height)

