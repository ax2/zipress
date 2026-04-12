"""FastAPI entry point for the zipress image layout engine."""

from __future__ import annotations

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers.layout import UPLOAD_DIR, ensure_storage_dirs, router as layout_router

ensure_storage_dirs()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_storage_dirs()
    yield


app = FastAPI(title="zipress engine", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(layout_router)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

