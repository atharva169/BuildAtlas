<h1 align="center">🏗️ BuildAtlas GenAI</h1>
<h3 align="center">AI-Powered Construction Intelligence for India</h3>

---

## 📋 Project Details

| Field | Value |
|-------|-------|
| **Project Name** | BuildAtlas GenAI |
| **Tagline** | *From plot dimensions to project handover — one AI platform* |
| **Track** | GenAI / Construction Tech |
| **Team** | [Team Name] |
| **Members** | [Name 1], [Name 2], [Name 3] |

---

## 🎯 Problem Statement

Indian residential construction is a ₹12 lakh crore industry where **80% of projects exceed budget by 20–40%** and **70% miss deadlines**. The root cause: planning is fragmented across spreadsheets, manual calculations, and disconnected tools. A homeowner building a G+2 house in Bengaluru has no way to get an instant, data-driven answer to *"What will this cost?"*, *"What happens if steel prices rise 15%?"*, or *"Can I fit a 2BHK in my budget?"* — until now.

## 💡 Solution Overview

**BuildAtlas GenAI** is a full-stack AI platform that takes a single project brief (plot size, location, budget, BHK type) and generates **10 interconnected outputs in under 2 seconds**:

A **Vastu-compliant floor plan**, a **cost estimate with P10/P50/P90 confidence bands**, a **monsoon-adjusted Gantt schedule**, a **risk register with AI narratives**, a **delay cascade simulator**, a **what-if sandbox** for real-time cost sensitivity, a **reverse planner** (budget → feasible options), **material swap analysis** with IS code references, **resource allocation** by phase, and a **regulatory compliance tracker** — all powered by Google Gemini AI and grounded in Indian construction data.

The platform works **offline-first**: pre-computed seed data loads instantly, with API results merging seamlessly in the background. Judges can demo the entire platform without any backend dependency.

---

## 🚀 Key Innovations

1. **Confidence-Band Estimation** — Not one number, three (P10/P50/P90). The system identifies TMT steel as the primary variance driver and quantifies the spread. No Indian construction tool does this.

2. **Monsoon-Aware Scheduling** — City-specific monsoon windows are baked into the Gantt chart. Bengaluru's Jun–Sep rainfall automatically adds 4-week buffers to outdoor phases with dependency-aware cascading.

3. **Live What-If Sandbox** — Drag sliders for steel (+15%), labour, cement, timeline — see cost, schedule, and risk impact recalculate in 200ms. This replaces days of spreadsheet modeling.

4. **Reverse Planning** — Flip the workflow: enter budget + deadline, get 3 feasible build configurations (Economy/Standard/Premium) with specific tradeoffs. No other construction tool does input→output reversal.

5. **Project-Grounded AI Copilot** — Not a generic chatbot. The copilot knows your project's city, area, budget, and soil type. Ask *"Can I use AAC blocks?"* and get a Bengaluru-specific answer with IS code references, cost savings, and availability data.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Zustand, Recharts, TailwindCSS |
| Backend | Python 3.11, FastAPI, Pydantic v2 |
| AI | Google Gemini AI (generative + grounding) |
| Vector DB | FAISS (IS code / CPWD reference retrieval) |
| Design | Dark theme, glassmorphism, micro-animations |
| Offline | Seed data + offline-first hook pattern |

---

## ⚡ How to Run (3 Commands)

```bash
# 1. Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# 2. Frontend
cd frontend && npm install && npm run dev

# 3. Demo Mode (no backend needed)
echo "VITE_DEMO_MODE=true" > frontend/.env && cd frontend && npm run dev
```

---

## 🔗 Demo URL

> **[Placeholder — insert deployed URL]**

---

## ✅ What Works

- [x] AI Floor Plan Generator (Vastu-compliant, 12-room layout)
- [x] Cost Estimation with P10/P50/P90 confidence bands + 12-item BOQ
- [x] What-If Sandbox (4 sliders, real-time cost/schedule/risk delta)
- [x] Monsoon-adjusted schedule with Gantt view
- [x] Delay cascade simulator (7 downstream phases recalculate)
- [x] Reverse planning (budget → 3 build options)
- [x] Risk engine with 5 scored risks + AI narratives
- [x] Material swap analyzer (AAC vs clay brick, IS code references)
- [x] Resource allocation by phase (crew + equipment)
- [x] AI Copilot with project-grounded responses
- [x] Regulatory compliance tracker (BBMP, BWSSB, BESCOM, KSPCB)
- [x] Offline-first with zero-error demo mode

## 🔮 What's Planned

- [ ] Multi-project portfolio dashboard
- [ ] PDF report generation
- [ ] Real-time market price feeds (steel, cement)
- [ ] Collaborative sharing with contractors
- [ ] Mobile-native app (React Native)
