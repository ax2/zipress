# zipress

Open-source ID photo layout tool for print-ready sheets.

Upload a passport/ID photo, choose your paper size, and get a perfectly arranged print layout at 300 DPI — ready to print at home or at a photo shop.

## Features

- **Multiple photo sizes**: 1-inch, small 2-inch, 2-inch, large 2-inch (Chinese standard)
- **Multiple paper sizes**: 5-inch, 6-inch, A4
- **Layout modes**: uniform (all same size) or mixed (combine sizes on one sheet)
- **Cutting guides**: dashed lines for easy trimming
- **Background colors**: white, blue, red, or custom
- **300 DPI output**: print-quality image ready for use
- **Email auth**: simple account system with email/password

## Architecture

```
zipress/
├── web/       # Next.js 15 frontend + auth (TypeScript, TailwindCSS, shadcn/ui)
├── engine/    # Python image processing engine (FastAPI, Pillow)
└── docker-compose.yml
```

## Quick Start

```bash
# Development
docker compose -f docker-compose.dev.yml up

# Production
docker compose up -d
```

Or run services individually:

```bash
# Engine (Python)
cd engine
uv sync
uv run uvicorn app.main:app --reload --port 8000

# Web (Next.js)
cd web
pnpm install
pnpm dev
```

## Tech Stack

**Frontend**: Next.js 15 (App Router) · TypeScript · TailwindCSS · shadcn/ui · better-auth · Drizzle ORM

**Engine**: Python 3.12 · FastAPI · Pillow · uvicorn

**Infrastructure**: Docker Compose · SQLite (dev) / PostgreSQL (prod)

## Standard Sizes (300 DPI)

| Photo Size | mm | px |
|-----------|-----|-----|
| 1-inch | 25 × 35 | 295 × 413 |
| Small 2-inch | 33 × 48 | 390 × 567 |
| 2-inch | 35 × 49 | 413 × 579 |
| Large 2-inch | 35 × 53 | 413 × 626 |

| Paper Size | mm | px |
|-----------|------|------|
| 5-inch | 89 × 127 | 1050 × 1500 |
| 6-inch | 102 × 152 | 1205 × 1795 |
| A4 | 210 × 297 | 2480 × 3508 |

## License

[MIT](LICENSE)
