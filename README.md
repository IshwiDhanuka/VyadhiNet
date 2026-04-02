<p align="center">
  <img src="https://img.shields.io/badge/CODECURE-SPIRIT%202026-16a34a?style=for-the-badge" alt="CODECURE SPIRIT 2026" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-f97316?style=for-the-badge" alt="Groq LLaMA" />
  <img src="https://img.shields.io/badge/Data-5%20Live%20APIs-1d4ed8?style=for-the-badge" alt="5 Live APIs" />
  <img src="https://img.shields.io/badge/Mock%20Data-Zero-dc2626?style=for-the-badge" alt="Zero Mock Data" />
</p>

# VyadhiNet

**AI-Powered Communicable Disease Outbreak Detection for Rural India**

> *"व्याधि" (Vyadhi) — Sanskrit for disease. VyadhiNet catches outbreaks before they spiral.*

VyadhiNet digitises and automates the grassroots disease surveillance pipeline for India's **6.4 lakh+ ASHA workers** spread across **6 lakh+ villages**. Field workers submit real-time symptom reports from a mobile-first form; AI classifies symptoms into ICD-10 coded diagnoses, the system runs WHO/IDSP-calibrated outbreak detection against a 7-day rolling window, and district health officers get a live dashboard with maps, alerts, trend charts, and AI spread predictions — all powered by **5 live public APIs and zero hardcoded data**.

---

## The Problem

Rural India's 640,000+ ASHA workers still manually fill paper forms when patients present symptoms. By the time this data percolates to district health officers through bureaucratic channels, outbreaks are already spreading unchecked. The delay between symptom appearance and institutional response costs lives.

**VyadhiNet replaces this paper trail with an AI-first digital pipeline that goes from symptom report to outbreak alert in seconds.**

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        VyadhiNet Architecture                        │
├──────────────┬──────────────────┬────────────────────────────────────┤
│  Layer 0     │  Real-World Data │  5 Live APIs + Supabase (Postgres) │
│  Layer 1     │  Field Input     │  Next.js mobile-first report form  │
│  Layer 2     │  AI Engine       │  Groq LLaMA 3.3 70B (NLP + pred.) │
│  Layer 3     │  Command Center  │  Leaflet maps + Chart.js dashboard │
└──────────────┴──────────────────┴────────────────────────────────────┘
```

### Data Flow

```
ASHA Worker → Report Form → /api/submit → Groq AI Classification
                                              ↓
                               Supabase (reports table)
                                              ↓
                     /api/dashboard → Outbreak Detection Engine
                          ↓                        ↓
                   WHO/IDSP Threshold      Weather + Baseline
                     Comparison             Enrichment
                          ↓                        ↓
                    Alert Generation → Supabase (alerts table)
                          ↓
              District Officer Dashboard (real-time)
```

---

## Live API Integrations

Every data point in the system comes from a live source — **no mock JSON, no hardcoded datasets**.

| API | Provider | What It Returns | Used For |
|-----|----------|----------------|----------|
| **data.gov.in** | NIC / MoHFW | District-wise case counts (dengue, malaria, TB, cholera) | Historical baseline for outbreak context |
| **Nominatim** | OpenStreetMap | Lat/lng coordinates for any Indian village | Map placement + village autocomplete |
| **Overpass API** | OpenStreetMap | Real PHC/hospital/clinic locations by district | Nearest PHC routing for alerts |
| **Open-Meteo** | Open-Meteo | Rainfall, temperature, humidity forecasts | Weather risk overlay (dengue/malaria correlation) |
| **IDSP Scraper** | NCDC India | Weekly P/L/S active outbreak reports | National outbreak context feed |

---

## Features

### 📋 ASHA Worker Report Form
- Mobile-first responsive design with touch-friendly UI
- 16 symptom options mapped in Hindi + English
- Real village search powered by OpenStreetMap Nominatim
- Patient demographics (age, gender) collection
- Free-text symptom input for AI analysis

### 🤖 AI Disease Classification
- Groq LLaMA 3.3 70B processes symptom text (including Hinglish)
- Returns structured JSON with ICD-10 coded diagnoses
- Severity scoring (1–5 scale) with urgency levels
- Red flag identification for critical symptoms

### 🚨 WHO/IDSP Outbreak Detection
- 7-day rolling window cluster analysis by disease + district
- 14 diseases with calibrated thresholds from WHO, IDSP, NVBDCP, and RNTCP
- RED / AMBER tiered alert system
- Automatic upsert to Supabase alerts table

### 🗺️ Live Outbreak Map
- Leaflet with CartoDB dark tiles
- Color-coded risk markers (RED / AMBER)
- Real PHC locations from Overpass API overlaid on map
- Radius circles showing outbreak spread zones

### 📊 Analytics Dashboard
- **Disease Distribution** — Chart.js doughnut chart (30-day window)
- **Reports Trend** — 7-day line chart
- **District Breakdown** — Sortable table with alert status badges
- **Alert Feed** — Live sidebar with severity indicators
- **AI Spread Predictions** — Estimated days to spread, at-risk villages, transmission vectors

### ⚡ Real-Time Updates
- Supabase realtime subscriptions — no page refresh needed
- 30-second auto-polling fallback
- Manual "Run Detection" trigger for immediate analysis

---

## Disease Alert Thresholds

Calibrated against published epidemiological guidelines:

| Disease | Cases / 7 days | Villages | Alert Level | Source |
|---------|---------------|----------|-------------|--------|
| COVID-19 | 5+ | 1+ | 🔴 RED | WHO Epidemic Threshold |
| Dengue | 10+ | 1+ | 🟡 AMBER | IDSP P-Form Trigger |
| Malaria | 3+ | 1+ | 🔴 RED | NVBDCP Alert Criteria |
| Cholera | 2+ | 1+ | 🔴 RED | WHO — any cluster = alert |
| Tuberculosis | 3+ | 1+ | 🟡 AMBER | RNTCP Cluster Definition |
| Typhoid | 8+ | 1+ | 🟡 AMBER | IDSP S-Form Threshold |
| Measles | 5+ | 1+ | 🔴 RED | WHO SEARO Alert Criteria |
| Chikungunya | 15+ | 1+ | 🟡 AMBER | NVBDCP State Alert Level |
| Hepatitis A/E | 6+ | 1+ | 🟡 AMBER | IDSP Standard Definition |
| Acute Diarrhea | 15+ | 1+ | 🟡 AMBER | IDSP Standard Definition |
| Acute Respiratory Infection | 10+ | 1+ | 🟡 AMBER | IDSP Standard Definition |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.2 |
| Language | TypeScript | 5.x |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Maps | Leaflet + React-Leaflet | 1.9.4 / 5.0 |
| Charts | Chart.js | 4.5.1 |
| Icons | Lucide React | 0.363 |
| Database | Supabase (PostgreSQL) | — |
| AI | Groq (LLaMA 3.3 70B Versatile) | — |
| Deployment | Vercel-ready | — |

---

## Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Groq](https://console.groq.com) API key (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/IshwiDhanuka/VyadhiNet.git
cd VyadhiNet
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=gsk_your_groq_api_key
```

### 3. Database Setup

Copy the contents of `supabase_schema.sql` and run it in your Supabase project's **SQL Editor**. This creates:
- `reports` — ASHA worker symptom submissions
- `alerts` — AI + threshold-triggered outbreak alerts
- `villages` — Cached village coordinates from Nominatim
- `phc_locations` — Cached PHC locations from Overpass
- `disease_baseline` — Historical case data from data.gov.in
- Realtime subscriptions and performance indexes

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page will load.

---

## Project Structure

```
VyadhiNet/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (Inter font, metadata)
│   ├── globals.css                 # Global styles (Tailwind)
│   ├── report/
│   │   └── page.tsx                # ASHA worker report form
│   ├── dashboard/
│   │   ├── page.tsx                # District officer dashboard
│   │   ├── OutbreakMap.tsx         # Leaflet map (dynamic import, SSR disabled)
│   │   ├── DiseasePieChart.tsx     # Chart.js doughnut chart
│   │   ├── TrendChart.tsx          # 7-day reports line chart
│   │   ├── AlertFeed.tsx           # Live alert sidebar
│   │   └── PredictionPanel.tsx     # AI spread prediction cards
│   ├── components/
│   │   └── VillageSearch.tsx       # Nominatim-powered village autocomplete
│   └── api/
│       ├── submit/route.ts         # POST: report → AI classify → Supabase
│       ├── analyse/route.ts        # POST: standalone AI analysis endpoint
│       ├── dashboard/route.ts      # GET: fetch data | POST: trigger detection
│       └── weather/route.ts        # GET: Open-Meteo weather proxy
├── lib/
│   ├── gemini.ts                   # Groq LLaMA 3.3 70B API wrapper
│   ├── outbreak.ts                 # Outbreak detection engine (thresholds + enrichment)
│   ├── supabase.ts                 # Supabase client initialization
│   ├── villageGraph.ts             # Village adjacency graph for spread prediction
│   └── fetchers/
│       ├── nominatim.ts            # OpenStreetMap village geocoding
│       ├── overpass.ts             # PHC/hospital location fetcher
│       ├── openMeteo.ts            # Weather data (rainfall, temp, humidity)
│       ├── dataGovIn.ts            # Government disease baseline data
│       └── idspScraper.ts          # IDSP weekly outbreak report scraper
├── supabase_schema.sql             # Complete database schema
├── package.json
└── tsconfig.json
```

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/submit` | POST | Accepts symptom report, runs AI classification via Groq, saves to Supabase |
| `/api/analyse` | POST | Standalone AI analysis for symptom text |
| `/api/dashboard` | GET | Returns reports, alerts, and computed statistics |
| `/api/dashboard` | POST | Triggers outbreak detection engine manually |
| `/api/weather` | GET | Proxies Open-Meteo for weather data by lat/lng |

---

## How It Works (End-to-End)

1. **ASHA worker** opens `/report` on their phone, selects village (Nominatim autocomplete), enters patient info and symptoms
2. **Form submits** to `/api/submit` → Groq LLaMA 3.3 receives the symptom text and returns structured JSON (disease candidates, ICD-10 codes, severity 1–5, red flags, urgency)
3. **Report saved** to Supabase `reports` table with AI analysis attached
4. **Dashboard polls** every 30 seconds (or officer clicks "Run Detection")
5. **Outbreak engine** clusters reports by disease + district over a 7-day window, compares against WHO/IDSP thresholds
6. **Enrichment** — weather risk from Open-Meteo, historical baseline from data.gov.in
7. **Alerts generated** (RED/AMBER) and upserted to Supabase `alerts` table
8. **Dashboard renders** — Leaflet map with risk markers, PHC locations, Chart.js analytics, alert feed, and AI spread predictions

---

## Team

| Name | Role |
|------|------|
| [Ishwi Dhanuka](https://github.com/IshwiDhanuka) | Developer |
| [Hussain Haidary](https://github.com/Heisenberg-Vader) | Developer |
| [Aditya Sharma](https://github.com/quiquietus) | Developer |

Built for **CODECURE · SPIRIT 2026**

---

<p align="center">
  <strong>VyadhiNet v2.0</strong> · Real-World Architecture · 5 Live APIs · Zero Mock Data
</p>
