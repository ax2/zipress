"""Unit tests for layout calculation and rendering."""

from __future__ import annotations

from PIL import Image

from app.config import PAPER_SIZES, PHOTO_SIZES
from app.services.layout_engine import (
    calculate_mixed_layout,
    calculate_uniform_layout,
    render_layout,
)


def _cells_overlap(a, b) -> bool:
    ax2, ay2 = a.x + a.width, a.y + a.height
    bx2, by2 = b.x + b.width, b.y + b.height
    return not (ax2 <= b.x or bx2 <= a.x or ay2 <= b.y or by2 <= a.y)


def test_uniform_layout_6inch_1inch() -> None:
    """6 寸纸 + 1 寸照：在默认边距与 300 DPI 下网格为 4 行×3 列（共 12 格）。

    常见线下「6 寸排 8 张 1 寸」与可打印像素网格不必一致；此处断言引擎实际铺排结果。
    """
    r = calculate_uniform_layout("1寸", "6寸")
    z = r.zones[0]
    assert z.rows == 4
    assert z.cols == 3
    assert r.total_photos == 12
    assert len(z.positions) == 12


def test_uniform_layout_a4_1inch() -> None:
    r = calculate_uniform_layout("1寸", "A4")
    assert r.total_photos > 20
    assert r.zones[0].rows * r.zones[0].cols == r.total_photos


def test_uniform_layout_positions_no_overlap() -> None:
    for paper_key in PAPER_SIZES:
        for photo_key in PHOTO_SIZES:
            r = calculate_uniform_layout(photo_key, paper_key)
            positions = [p for z in r.zones for p in z.positions]
            for i, a in enumerate(positions):
                for b in positions[i + 1 :]:
                    assert not _cells_overlap(a, b), (
                        f"overlap {paper_key}+{photo_key}: {a} vs {b}"
                    )


def test_mixed_layout_a4() -> None:
    r = calculate_mixed_layout("2寸", "1寸", "A4")
    assert len(r.zones) == 2
    assert r.zones[0].photo_size_key == "2寸"
    assert r.zones[1].photo_size_key == "1寸"


def test_render_layout_produces_image() -> None:
    layout = calculate_uniform_layout("1寸", "6寸")
    photo = Image.new("RGB", (100, 140), color=(255, 0, 0))
    out = render_layout(photo, layout, cutting_guides=False)
    assert out.size == (layout.paper_width, layout.paper_height)
    assert out.mode == "RGB"


def test_render_layout_with_cutting_guides() -> None:
    layout = calculate_uniform_layout("1寸", "6寸")
    photo = Image.new("RGB", (100, 140), color=(255, 0, 0))
    out = render_layout(photo, layout, cutting_guides=True)
    assert out.size == (layout.paper_width, layout.paper_height)
    assert out.mode == "RGB"

    # 与无辅助线版本同尺寸（辅助线画在画布内/角标向外延伸不改变画布大小）
    plain = render_layout(photo, layout, cutting_guides=False)
    assert plain.size == out.size

