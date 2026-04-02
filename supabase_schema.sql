-- VyadhiNet v2.0 Supabase Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- REPORTS table (ASHA worker symptom reports)
create table if not exists reports (
  id              uuid primary key default uuid_generate_v4(),
  village_name    text not null,
  lat             float,
  lng             float,
  district        text,
  state           text,
  patient_age     integer,
  gender          text,
  symptoms        text[] default '{}',
  raw_text        text,
  disease_ai_guess text,
  severity_score  integer default 1,
  red_flags       text[] default '{}',
  urgency         text default 'monitor',
  ai_full_response jsonb,
  submitted_at    timestamptz default now()
);

-- ALERTS table (AI + threshold-triggered outbreak alerts)
create table if not exists alerts (
  id                  uuid primary key default uuid_generate_v4(),
  disease             text not null,
  district            text not null,
  state               text,
  village_name        text,
  case_count          integer default 0,
  risk_level          text default 'AMBER',  -- 'RED' | 'AMBER'
  threshold_source    text,
  weather_risk        text default 'low',
  historical_baseline integer default 0,
  center_lat          float,
  center_lng          float,
  predicted_spread    jsonb default '{}',
  created_at          timestamptz default now(),
  unique(disease, district)        -- upsert key
);

-- VILLAGES cache (pre-seeded from Nominatim)
create table if not exists villages (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  district    text,
  state       text,
  lat         float,
  lng         float,
  population  integer,
  nearest_phc_id uuid,
  created_at  timestamptz default now()
);

-- PHC_LOCATIONS cache (fetched from Overpass API weekly)
create table if not exists phc_locations (
  id       uuid primary key default uuid_generate_v4(),
  name     text not null,
  lat      float,
  lng      float,
  district text,
  phone    text,
  created_at timestamptz default now()
);

-- DISEASE_BASELINE (fetched from data.gov.in — refreshed daily)
create table if not exists disease_baseline (
  id          uuid primary key default uuid_generate_v4(),
  district    text,
  disease     text,
  year        integer,
  case_count  integer,
  source      text default 'data.gov.in',
  created_at  timestamptz default now()
);

-- Enable Realtime for live dashboard updates
alter publication supabase_realtime add table reports;
alter publication supabase_realtime add table alerts;

-- Indexes for performance
create index if not exists idx_reports_submitted_at on reports(submitted_at desc);
create index if not exists idx_reports_district on reports(district);
create index if not exists idx_reports_disease on reports(disease_ai_guess);
create index if not exists idx_alerts_district on alerts(district);
create index if not exists idx_alerts_risk on alerts(risk_level);
create index if not exists idx_alerts_created_at on alerts(created_at desc);
