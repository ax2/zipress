"""Standard photo and paper size definitions for ID photo layout."""

from dataclasses import dataclass

DPI = 300


@dataclass(frozen=True)
class SizeDef:
    name: str
    name_en: str
    width_mm: float
    height_mm: float

    @property
    def width_px(self) -> int:
        return round(self.width_mm / 25.4 * DPI)

    @property
    def height_px(self) -> int:
        return round(self.height_mm / 25.4 * DPI)

    @property
    def size_px(self) -> tuple[int, int]:
        return (self.width_px, self.height_px)


PHOTO_SIZES: dict[str, SizeDef] = {
    "1寸": SizeDef("1寸", "1-inch", 25, 35),
    "小2寸": SizeDef("小2寸", "small-2-inch", 33, 48),
    "2寸": SizeDef("2寸", "2-inch", 35, 49),
    "大2寸": SizeDef("大2寸", "large-2-inch", 35, 53),
}

PAPER_SIZES: dict[str, SizeDef] = {
    "5寸": SizeDef("5寸", "5-inch", 89, 127),
    "6寸": SizeDef("6寸", "6-inch", 102, 152),
    "A4": SizeDef("A4", "A4", 210, 297),
}

BACKGROUND_COLORS: dict[str, str] = {
    "white": "#FFFFFF",
    "blue": "#438EDB",
    "red": "#D73F3F",
}

DEFAULT_SPACING_MM = 1.0
DEFAULT_MARGIN_MM = 2.0


def mm_to_px(mm: float) -> int:
    return round(mm / 25.4 * DPI)


def mm_to_px_at(mm: float, dpi: int) -> int:
    return round(mm / 25.4 * dpi)

