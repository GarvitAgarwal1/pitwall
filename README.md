# PitWall – Formula 1 Strategy & Telemetry Dashboard

> Full‑stack web app that visualises live & historical F1 data, provides analytics and strategy tools (pit‑window detector, race predictor). Built with FastAPI, React + Vite, PostgreSQL & Redis.

## Quick start

```bash
# Clone the repo (already done)
cd pitwall

# Backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt   # (add later)
uvicorn backend.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Tech stack
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, Redis, Celery, httpx
- **Frontend:** React 18, Vite, TailwindCSS, Recharts, Axios
- **Containerisation:** Docker + Docker‑Compose

## License
MIT – see `LICENSE` file.
