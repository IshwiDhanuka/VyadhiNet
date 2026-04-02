# VyadhiNet — AI-Powered Disease Outbreak Detection for Rural India

[![CODECURE SPIRIT 2026 — IIT (BHU) Varanasi](https://img.shields.io/badge/CODECURE-SPIRIT%202026-16a34a?style=for-the-badge)](https://spirit.iitbhu.ac.in)
[![Live APIs](https://img.shields.io/badge/Data%20Sources-5%20Live%20APIs-blue?style=for-the-badge)]()
[![Zero Mock Data](https://img.shields.io/badge/Mock%20Data-Zero-dc2626?style=for-the-badge)]()

> **Applied AI | Health Tech | Revised v2.0 — Real World Architecture**

VyadhiNet empowers **640,000+ ASHA workers** across **6 lakh+ Indian villages** to submit real-time symptom reports. AI detects disease clusters, routes alerts to Primary Health Centres, and predicts spread — before outbreaks spiral.

---

## 🌟 Problem Statement

Rural India has 640,000+ ASHA workers who manually fill paper forms when patients show symptoms. By the time data reaches district health officers, outbreaks are already spreading. **VyadhiNet digitises and automates this pipeline with AI.**

## 🏗️ Architecture (4 Layers)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Layer 0 — Data** | 5 Live APIs + Supabase | Real data, zero mock JSON |
| **Layer 1 — Field** | Next.js (mobile-first) | ASHA worker report form |
| **Layer 2 — AI** | Groq LLaMA 3.3 70B | NLP + outbreak prediction |
| **Layer 3 — Dashboard** | Leaflet + Chart.js | District officer live view |

## 📡 5 Live Public APIs

| API | Provider | Returns | Used For |
|-----|----------|---------|---------|
| `data.gov.in` | NIC/MoHFW | District case counts (dengue, malaria, TB, cholera) | Baseline disease burden |
| `Nominatim (OSM)` | OpenStreetMap | Lat/lng for any Indian village | Map placement + autocomplete |
| `Overpass API` | OpenStreetMap | Real PHC/hospital locations in any district | PHC routing for alerts |
| `Open-Meteo` | Open-Meteo | Rainfall, temperature, humidity forecasts | Weather risk overlay |
| `IDSP Scraper` | NCDC India | Weekly P/L/S active outbreak reports | National outbreak context |

## ✨ Features

- **ASHA Report Form** — Mobile-first, 16 symptoms in Hindi+English, voice input ready, offline queue support
- **AI Classification** — Groq LLaMA 3.3 returns ICD-10 coded diagnoses, severity 1-5, urgency, red flags
- **WHO/IDSP Outbreak Detection** — 14 diseases with calibrated thresholds (WHO, IDSP, NVBDCP, RNTCP)
- **Live Outbreak Map** — Leaflet with CartoDB tiles, colored risk markers, PHC locations, radius circles
- **Disease Trend Charts** — Chart.js doughnut (distribution) + line (7-day trends)
- **AI Spread Predictions** — Estimated days to spread, at-risk villages, transmission vector
- **Auto-Refresh Dashboard** — Supabase realtime subscriptions, no page refresh needed

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GROQ_API_KEY

# 3. Create Supabase tables
# Run supabase_schema.sql in your Supabase SQL Editor

# 4. Run dev server
npm run dev
```

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=gsk_your_groq_key
```

## 📁 Project Structure

```
app/
  page.tsx              # Landing page
  report/page.tsx       # ASHA worker report form
  dashboard/
    page.tsx            # District officer dashboard
    OutbreakMap.tsx     # Leaflet outbreak map
    DiseasePieChart.tsx # Chart.js doughnut
    TrendChart.tsx      # 7-day line chart
    AlertFeed.tsx       # Live alert sidebar
    PredictionPanel.tsx # AI spread predictions
  api/
    submit/route.ts     # Report submit → AI → Supabase
    dashboard/route.ts  # Dashboard data + outbreak trigger
    weather/route.ts    # Open-Meteo proxy
lib/
  gemini.ts             # Groq LLaMA 3.3 wrapper
  outbreak.ts           # WHO/IDSP outbreak detection
  supabase.ts           # Supabase client
  villageGraph.ts       # Village adjacency graph
  fetchers/
    nominatim.ts        # Village coordinates
    overpass.ts         # PHC locations
    openMeteo.ts        # Weather data
    dataGovIn.ts        # Disease baseline
    idspScraper.ts      # IDSP outbreak feed
supabase_schema.sql     # Complete DB schema
```

## 🧪 Disease Alert Thresholds

| Disease | Cases/7d | Villages | Alert | Source |
|---------|----------|----------|-------|--------|
| COVID-19 | 5+ | 2+ | 🔴 RED | WHO Epidemic Threshold |
| Dengue | 10+ | 1+ | 🟡 AMBER | IDSP P-Form Trigger |
| Malaria | 3+ | 1+ | 🔴 RED | NVBDCP Alert Criteria |
| Cholera | 2+ | 1+ | 🔴 RED | WHO — any cluster = alert |
| TB | 3+ | 2+ | 🟡 AMBER | RNTCP Cluster Definition |
| Measles | 5+ | 1+ | 🔴 RED | WHO SEARO Alert Criteria |
| Chikungunya | 15+ | 2+ | 🟡 AMBER | NVBDCP State Alert Level |

## 👥 Team

Built in a **16-Hour Solo Sprint** for CODECURE, SPIRIT 2026, IIT (BHU) Varanasi.

---

*VyadhiNet v2.0 — Real World Architecture · Zero Mock Data · 5 Live APIs*
