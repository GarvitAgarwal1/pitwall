# PitWall — Formula 1 Strategy & Telemetry Dashboard

PitWall is a comprehensive, production-grade Formula 1 engineering and telemetry dashboard designed for motorsport enthusiasts, race engineers, and analysts. PitWall delivers real-time timing tower replays, high-frequency car telemetry overlays, tyre degradation and pit window optimization models, Monte Carlo race finish predictions, historical championship standings spanning 1950–current, interactive circuit technical profiles, and aggregated motorsport journalism.

---

## Architecture Overview

```
                                +---------------------------+
                                |    React 18 + Vite SPA    |
                                |  (TailwindCSS + Recharts) |
                                +-------------+-------------+
                                              |
                                     HTTP REST / JSON
                                              |
                                              v
                                +---------------------------+
                                |     FastAPI Backend       |
                                |    (Python 3.13-slim)     |
                                +-------------+-------------+
                                              |
                     +------------------------+------------------------+
                     |                        |                        |
                     v                        v                        v
        +-------------------------+  +--------------------+  +-------------------+
        |       OpenF1 API        |  |  Jolpica (Ergast)  |  |    RSS Feeds      |
        | (Live timing, telemetry,|  | (1950-Present F1   |  | (Autosport, BBC,  |
        |  intervals, weather)    |  |  records, circuits)|  |  Motorsport.com)  |
        +-------------------------+  +--------------------+  +-------------------+
```

### Technology Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS 3.4, Recharts 2.12, Lucide React icons, Axios.
- **Backend**: FastAPI 0.115, Python 3.13, Pydantic v2, SQLAlchemy 2.0 (async), aiosqlite / asyncpg, HTTPX, Redis 7 fallback caching, Celery.
- **Testing**: pytest 9.2, pytest-asyncio, Starlette TestClient, hermetic offline mocking harness.
- **Containerization**: Multi-stage Docker builds, Alpine Linux, Nginx reverse proxy, Docker Compose.

---

## 9 Core Dashboard Views

| # | View Name | Route | Core Functionality |
|---|---|---|---|
| **1** | **Home / Dashboard** | `/` | Hero countdown to the next Grand Prix, current championship podium standings, recent race results recap, and breaking news summary ticker. |
| **2** | **Live Timing** | `/live` | Real-time / replayed Grand Prix timing tower with live leaderboards, gap to leader, car-to-car intervals, sector split indicators, tyre compound & age badges, and race control safety car banners. |
| **3** | **Championship Standings** | `/standings` | Complete Driver and Constructor championship tables with points progression graphs across all rounds, historical season selector (1950 to current), and win tallies. |
| **4** | **Race Analysis** | `/race-analysis` | Post-race deep dive featuring lap charts, gap-to-leader progression curves, tyre stint strategies, pit stop durations (lane transit vs stationary stop), and session weather telemetry. |
| **5** | **Telemetry Viewer** | `/telemetry` | High-frequency car telemetry stream (speed, RPM, throttle, brake, gear, DRS) with synchronized distance-aligned trace comparisons and delta-time graphs between two rival drivers. |
| **6** | **Strategy Tools** | `/strategy` | Interactive pit stop strategy calculator utilizing linear regression wear slopes, tyre cliff lap projections, undercut/overcut viability metrics, and Monte Carlo finish order predictions. |
| **7** | **F1 Guide & Directory** | `/directory` | Historical all-time driver career records, constructor heritage profiles, head-to-head driver comparison matrix, and regulatory rule summaries. |
| **8** | **News Hub** | `/news` | Aggregated motorsport news feed combining Autosport, Motorsport.com, and BBC Sport with source filtering, thumbnail previews, and article links. |
| **9** | **Circuit Directory** | `/circuits` | Global interactive directory of Grand Prix tracks, technical specifications (length, corners, official lap records), historical winners list, and pole sitters. |

---

## 24 REST Endpoints Reference

The PitWall backend exposes 24 high-performance RESTful API endpoints organized across domain routers under the `/api` namespace prefix.

| # | HTTP Method | Endpoint Path | Description |
|---|---|---|---|
| 1 | `GET` | `/api/standings/drivers` | Fetch driver championship standings for a given season (supports `current` or 1950–2026). |
| 2 | `GET` | `/api/standings/constructors` | Fetch constructor championship standings for a given season. |
| 3 | `GET` | `/api/standings/progress` | Get cumulative points progression per round for top drivers and constructors. |
| 4 | `GET` | `/api/races/schedule` | Retrieve Grand Prix calendar and weekend timetables for any season. |
| 5 | `GET` | `/api/races/next` | Return the upcoming Grand Prix details with countdown timestamp. |
| 6 | `GET` | `/api/races/{season}/{round}/results` | Full race classification, points, finishing status, and fastest lap bonuses. |
| 7 | `GET` | `/api/races/{season}/{round}/qualifying` | Qualifying session results across Q1, Q2, and Q3 knockout rounds. |
| 8 | `GET` | `/api/races/{season}/{round}/laps` | Lap-by-lap timing, sector 1/2/3 splits, and optional `driver_number` filter. |
| 9 | `GET` | `/api/races/{season}/{round}/stints` | Tyre stint sequences, compound used (SOFT/MEDIUM/HARD), and lap boundaries. |
| 10 | `GET` | `/api/races/{season}/{round}/pitstops` | Detailed pit stops with stationary stop duration and total pit lane transit time. |
| 11 | `GET` | `/api/races/{season}/{round}/gaps` | Lap-by-lap gap to leader and car-to-car interval deltas. |
| 12 | `GET` | `/api/races/{season}/{round}/positions` | Full 20-driver position evolution across all race laps. |
| 13 | `GET` | `/api/races/{season}/{round}/weather` | Session meteorological telemetry (track temp, air temp, humidity, rainfall). |
| 14 | `GET` | `/api/telemetry/{session_key}/{driver_number}/{lap_number}` | High-frequency telemetry samples (speed, rpm, throttle, brake, gear, DRS). |
| 15 | `GET` | `/api/telemetry/compare` | Multi-driver synchronized distance-based telemetry overlay and time delta. |
| 16 | `GET` | `/api/drivers` | Directory of F1 drivers with nationality, permanent numbers, and codes. |
| 17 | `GET` | `/api/drivers/{driver_id}` | Detailed driver profile, biographical data, and headline career statistics. |
| 18 | `GET` | `/api/drivers/{driver_id}/career` | Multi-season career progression of points, wins, podiums, and teams. |
| 19 | `GET` | `/api/drivers/compare` | Head-to-head statistical comparison and head-to-head category winner keys. |
| 20 | `GET` | `/api/circuits` | Global circuit database with coordinates, length, turn counts, and lap records. |
| 21 | `GET` | `/api/circuits/{circuit_id}/history` | Historical Grand Prix winners, pole sitters, and maiden race year. |
| 22 | `GET` | `/api/strategy/pit-window/{session_key}/{driver_number}` | Real-time tyre degradation slope, cliff lap, and undercut viability solver. |
| 23 | `GET` | `/api/strategy/predict/{session_key}/{from_lap}` | Monte Carlo finish order prediction simulation with statistical confidence scores. |
| 24 | `GET` | `/api/news` | Aggregated news feed with search query, source filtering, and thumbnail links. |

---

## Local Setup & Development

### Prerequisites
- Python 3.11+ (Python 3.13 recommended)
- Node.js 20+ (Node.js 22 LTS recommended) and npm
- Docker and Docker Compose (optional for containerized deployment)

### Backend Setup
1. Navigate to the backend directory and activate your virtual environment:
   ```bash
   cd pitwall/backend
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
4. Access interactive API documentation:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd pitwall/frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## Docker Deployment

To launch the complete PitWall platform (FastAPI backend, React frontend, PostgreSQL database, and Redis cache):

```bash
cd pitwall
docker compose up --build -d
```

- **Frontend Application**: `http://localhost:5173` (or `http://localhost:80` in standalone container)
- **Backend API**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432` (user: `pitwall`, database: `pitwall_db`)
- **Redis**: `localhost:6379`

To stop all services:
```bash
docker compose down
```

---

## Running the Verification Test Suite

PitWall features a multi-tiered opaque-box test suite covering 174 contract specifications across schemas, endpoints, business logic, degradation models, and negative boundary resilience, as well as 196 backend unit tests.

### 1. Execute All E2E Integration Tests (174 Tests)
```bash
cd pitwall
.venv\Scripts\python.exe -m pytest tests/e2e -v
```

### 2. Execute Standalone Tiered Verification Runner
The standalone runner executes the complete 4-tier opaque-box test battery:
- **Tier 1 (Core Functional)**: 130 tests covering all 24 REST endpoints and 9 dashboard views.
- **Tier 2 (Algorithms & Calculations)**: 26 tests verifying linear regression tyre wear, undercut status, and race finish confidence.
- **Tier 3 (Data Schema & Contract Integrity)**: 12 tests verifying strict schema types, positive lap/sector durations, and non-empty arrays.
- **Tier 4 (Negative Boundaries & Resilience)**: 6 tests checking 404/422 responses on non-existent years, invalid session keys, and empty filters.

```bash
cd pitwall
.venv\Scripts\python.exe tests/e2e/e2e_runner.py
```

### 3. Execute Backend Unit Test Suite (196 Tests)
```bash
cd pitwall
.venv\Scripts\python.exe -m pytest backend/tests -v
```

---

## License

This project is licensed under the MIT License.
Formula 1 data provided by OpenF1 and Jolpica Ergast APIs. Formula 1 and F1 are registered trademarks of Formula One Licensing B.V.
