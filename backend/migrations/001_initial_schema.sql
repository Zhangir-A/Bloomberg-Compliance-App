-- CARIP Initial Database Schema
-- PostgreSQL DDL for Central Asia Risk Intelligence Platform

-- Create sanctions_list table
CREATE TABLE IF NOT EXISTS sanctions_list (
  id SERIAL PRIMARY KEY,
  name_latin VARCHAR(255) NOT NULL,
  name_cyrillic VARCHAR(255),
  list_source VARCHAR(50) NOT NULL,
  list_date DATE NOT NULL,
  dob DATE,
  nationality VARCHAR(10),
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sanctions_name ON sanctions_list(name_latin);
CREATE INDEX IF NOT EXISTS idx_sanctions_source ON sanctions_list(list_source);

-- Create pep_profiles table
CREATE TABLE IF NOT EXISTS pep_profiles (
  id SERIAL PRIMARY KEY,
  pep_id VARCHAR(50) UNIQUE NOT NULL,
  name_latin VARCHAR(255) NOT NULL,
  name_cyrillic VARCHAR(255),
  position VARCHAR(500),
  organization VARCHAR(500),
  tier INT CHECK (tier BETWEEN 1 AND 4),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  associates JSONB,
  source_urls JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pep_name ON pep_profiles(name_latin);
CREATE INDEX IF NOT EXISTS idx_pep_active ON pep_profiles(is_active);

-- Create adverse_media table
CREATE TABLE IF NOT EXISTS adverse_media (
  id SERIAL PRIMARY KEY,
  alert_id VARCHAR(50) UNIQUE NOT NULL,
  date DATE NOT NULL,
  source VARCHAR(255) NOT NULL,
  headline TEXT NOT NULL,
  summary VARCHAR(500),
  category VARCHAR(100),
  entities JSONB,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adverse_media_date ON adverse_media(date);
CREATE INDEX IF NOT EXISTS idx_adverse_media_category ON adverse_media(category);

-- Create screening_requests table
CREATE TABLE IF NOT EXISTS screening_requests (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(50) UNIQUE NOT NULL,
  input_name VARCHAR(255) NOT NULL,
  input_dob DATE,
  input_nationality VARCHAR(10),
  match_count INT DEFAULT 0,
  response_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screening_request_id ON screening_requests(request_id);

-- Create case_decisions table
CREATE TABLE IF NOT EXISTS case_decisions (
  id SERIAL PRIMARY KEY,
  match_id VARCHAR(100) NOT NULL,
  match_type VARCHAR(50) NOT NULL,
  decision VARCHAR(50) NOT NULL,
  notes TEXT,
  request_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_decision_type ON case_decisions(match_type);
CREATE INDEX IF NOT EXISTS idx_case_decision_request ON case_decisions(request_id);
