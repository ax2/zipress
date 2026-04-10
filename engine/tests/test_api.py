"""HTTP API tests for the zipress engine FastAPI app."""

from __future__ import annotations

from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from PIL import Image


@pytest.fixture
def client(tmp_path, monkeypatch) -> TestClient:
    import app.routers.layout as layout_mod

    monkeypatch.setattr(layout_mod, "UPLOAD_DIR", tmp_path / "uploads")
    monkeypatch.setattr(layout_mod, "OUTPUT_DIR", tmp_path / "outputs")
    layout_mod.ensure_storage_dirs()

    from app.main import app

    return TestClient(app)


def test_health(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_get_sizes(client: TestClient) -> None:
    r = client.get("/sizes")
    assert r.status_code == 200
    data = r.json()
    assert "photo_sizes" in data
    assert "paper_sizes" in data
    assert isinstance(data["photo_sizes"], list)
    assert isinstance(data["paper_sizes"], list)
    assert len(data["photo_sizes"]) >= 1
    assert len(data["paper_sizes"]) >= 1


def test_upload_jpeg(client: TestClient) -> None:
    im = Image.new("RGB", (64, 64), color=(10, 120, 200))
    buf = BytesIO()
    im.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    r = client.post(
        "/upload",
        files={"file": ("test.jpg", buf, "image/jpeg")},
    )
    assert r.status_code == 200
    body = r.json()
    assert "photo_id" in body
    assert len(body["photo_id"]) > 0


def test_upload_invalid(client: TestClient) -> None:
    r = client.post(
        "/upload",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
    )
    assert r.status_code == 400


def test_layout_uniform(client: TestClient) -> None:
    im = Image.new("RGB", (200, 280), color=(200, 50, 50))
    buf = BytesIO()
    im.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    up = client.post("/upload", files={"file": ("p.jpg", buf, "image/jpeg")})
    assert up.status_code == 200
    photo_id = up.json()["photo_id"]

    r = client.post(
        f"/layout?photo_id={photo_id}",
        json={
            "photo_size": "1寸",
            "paper_size": "A4",
            "layout_mode": "uniform",
            "options": {
                "background_color": "#FFFFFF",
                "spacing_mm": 1.0,
                "margin_mm": 2.0,
                "cutting_guides": True,
                "dpi": 300,
            },
        },
    )
    assert r.status_code == 200
    body = r.json()
    assert "layout_id" in body
    assert body["total_photos"] > 0


def test_preview_and_download(client: TestClient) -> None:
    im = Image.new("RGB", (180, 250), color=(30, 180, 90))
    buf = BytesIO()
    im.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    up = client.post("/upload", files={"file": ("q.jpg", buf, "image/jpeg")})
    photo_id = up.json()["photo_id"]

    lo = client.post(
        f"/layout?photo_id={photo_id}",
        json={
            "photo_size": "1寸",
            "paper_size": "6寸",
            "layout_mode": "uniform",
            "options": {"cutting_guides": False},
        },
    )
    assert lo.status_code == 200
    layout_id = lo.json()["layout_id"]

    prev = client.get(f"/preview/{layout_id}")
    assert prev.status_code == 200
    assert prev.headers.get("content-type", "").startswith("image/jpeg")

    dl = client.get(f"/download/{layout_id}")
    assert dl.status_code == 200
    assert dl.headers.get("content-type", "").startswith("image/jpeg")
