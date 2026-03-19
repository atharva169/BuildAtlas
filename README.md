<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Gemini%20AI-Powered-8E75B2?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<h1 align="center">🏗️ BuildAtlas GenAI</h1>
<h3 align="center">Smart Construction Intelligence Platform for India</h3>

<p align="center">
  AI-powered construction planning that generates floor plans, cost estimates, schedules, risk assessments, and resource plans — all from a single project brief. Built for the Indian construction market with IS code compliance, Vastu awareness, and monsoon-adjusted scheduling.
</p>

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🏠 AI Floor Plan Generator** | Vastu-compliant room layouts with correct zone placement (kitchen in SE, master in SW) |
| **💰 Cost Estimation with Confidence Bands** | P10/P50/P90 estimates with 12-item BOQ, not a single number |
| **📊 What-If Scenario Analysis** | Real-time cost impact of steel, cement, labour, and timeline changes |
| **📅 Monsoon-Aware Scheduling** | Auto-buffers outdoor phases for city-specific monsoon windows |
| **⚡ Delay Cascade Simulator** | Slip one phase → see all downstream impacts recalculate in 200ms |
| **🔄 Reverse Planning** | Enter budget + deadline → get 3 feasible build configurations |
| **🛡️ Risk Engine** | 5 scored risks with AI narratives and severity-weighted scoring |
| **🧱 Material Swap Analyzer** | Compare AAC vs clay brick, OPC vs PPC — with IS code references |
| **🤖 Project-Grounded AI Copilot** | Context-aware chatbot that knows your project, city, and budget |
| **📋 Compliance Tracker** | Auto-generated BBMP, BWSSB, BESCOM, KSPCB checklist with TATs |

---

## 🏗️ Architecture

```
BuildAtlas/
├── backend/                  # FastAPI + Gemini AI
│   ├── app/
│   │   ├── main.py           # App entry, CORS, middleware
│   │   ├── models.py         # Pydantic request/response models
│   │   ├── api/routes.py     # All REST endpoints
│   │   ├── engines/          # Computation engines (cost, schedule, risk, etc.)
│   │   └── ai/               # Gemini AI integration
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                 # React + Vite + Zustand
│   ├── src/
│   │   ├── App.jsx           # Router + ErrorBoundary
│   │   ├── store/            # Zustand state (pre-hydrated with seed data)
│   │   ├── hooks/            # useProjectData (offline-first)
│   │   ├── data/             # demoProject.js, demoFlow.js
│   │   ├── services/api.js   # API client
│   │   ├── components/
│   │   │   ├── features/     # Dashboard, FloorPlan, Schedule, etc.
│   │   │   ├── layout/       # Shell, Sidebar, Copilot
│   │   │   └── ui/           # Card, Badge, StatCard, Button, etc.
│   │   └── utils/            # Constants, calculations, formatters
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.11+
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/BuildAtlas.git
cd BuildAtlas
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API docs will be at: **http://localhost:8000/docs**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env if needed (defaults work for local development)

# Start dev server
npm run dev
```

The app will open at: **http://localhost:5173**

---

## 🎯 Demo Mode (Offline)

For hackathon demos or when the backend is unavailable, BuildAtlas runs entirely from pre-computed seed data.

### How to Enable

Set in `frontend/.env`:
```
VITE_DEMO_MODE=true
```

### What Happens in Demo Mode

1. **Instant load** — All data is pre-hydrated in the Zustand store before React renders
2. **No API calls** — The `useProjectData` hook skips all network requests
3. **Full functionality** — Every page shows realistic data for **"Sharma Residence — G+2"**
4. **Zero errors** — No loading spinners, no error states, no network timeouts

### Demo Project: Sharma Residence

| Field | Value |
|-------|-------|
| Project | Sharma Residence — G+2 |
| City | Bengaluru |
| Plot | 12m × 9m, East Facing |
| Type | 2BHK Residential |
| Quality | Standard |
| Budget | ₹1.8 Crore target |
| Start | June 2025 |
| Vastu | ✅ Enabled |

---

## 🎬 Demo Flow Guide (for Judges)

Follow this 8-step sequence for a compelling ~2.5 minute demo:

| # | Title | Page | What to Show |
|---|-------|------|--------------|
| 1 | **Enter Project Details** | Floor Plan | Auto-filled Sharma Residence form → hit Generate |
| 2 | **Floor Plan Generated** | Floor Plan | Vastu-compliant layout — kitchen in SE (Agni corner) |
| 3 | **Cost Estimate** | Dashboard | P10 ₹1.55Cr / P50 ₹1.84Cr / P90 ₹2.31Cr + 12-item BOQ |
| 4 | **What-If: Steel +15%** | What-If | Move steel slider → cost jumps to ₹1.93Cr |
| 5 | **Monsoon Schedule** | Schedule | Gantt with 8-week monsoon buffer auto-applied |
| 6 | **Delay Cascade** | Delay Cascade | Slip foundation 3 weeks → downstream recalculation |
| 7 | **Reverse Planning** | Reverse Plan | ₹50L budget → 3 options: Economy/Standard/Premium |
| 8 | **AI Copilot** | Dashboard | Ask "Can I use AAC blocks?" → context-aware answer |

> **Tip**: The full demo script with presenter narration is in `src/data/demoFlow.js`

---

## 🔌 API Documentation

All endpoints accept/return JSON. Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/project` | Create/validate project |
| `POST` | `/api/floorplan` | Generate Vastu-compliant floor plan |
| `POST` | `/api/estimate` | Cost estimate with P10/P50/P90 bands |
| `POST` | `/api/schedule` | Monsoon-adjusted construction schedule |
| `POST` | `/api/resources` | Crew & equipment allocation by phase |
| `POST` | `/api/risks` | Risk assessment with AI narratives |
| `POST` | `/api/whatif` | What-if cost scenario (query params: `steel_price_pct`, `labour_rate_pct`, `timeline_weeks`, `cement_price_pct`) |
| `POST` | `/api/reverse` | Reverse plan: budget + deadline → build options |
| `POST` | `/api/cascade` | Delay cascade simulation (query params: `delayed_phase_index`, `delay_weeks`) |
| `GET` | `/api/materials/{category}` | Material options (masonry, cement, steel, roofing) |
| `POST` | `/api/materials/swap` | Material swap cost/time analysis |
| `POST` | `/api/copilot` | AI copilot chat with project context |
| `POST` | `/api/compliance` | Regulatory compliance checklist |

### Example Request

```bash
curl -X POST http://localhost:8000/api/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Sharma Residence — G+2",
    "city": "Bengaluru",
    "project_type": "residential",
    "floors": 3,
    "plot_length_ft": 39.37,
    "plot_width_ft": 29.53,
    "builtup_sqft": 3484,
    "quality": "standard",
    "vastu": true,
    "start_month": 6,
    "start_year": 2025,
    "soil_type": "medium",
    "bhk_type": "2BHK"
  }'
```

---

## 🛠️ Environment Variables

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | _(empty — uses proxy)_ | Backend API URL |
| `VITE_GEMINI_API_KEY` | — | Gemini API key (if client-side AI) |
| `VITE_DEMO_MODE` | `true` | Run from seed data without API |

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | — | Google Gemini API key (required) |
| `CORS_ORIGINS` | `localhost:5173,3000` | Allowed CORS origins |

---

## 🧪 Tech Stack

- **Frontend**: React 18, Vite 5, Zustand (state), Recharts (charts), Lucide (icons), TailwindCSS
- **Backend**: FastAPI, Pydantic v2, Google Gemini AI, FAISS (vector search)
- **Offline**: Pre-computed seed data with offline-first hook pattern
- **Design**: Dark theme, glassmorphism, micro-animations

---

<p align="center">
  Made with ❤️ for Indian construction by <strong>Team BuildAtlas</strong>
</p>
