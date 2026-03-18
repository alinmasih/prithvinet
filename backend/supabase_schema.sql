-- Core Schema for PrithviNet (Supabase/PostgreSQL)
-- Ensure we are in the public schema
SET search_path TO public;

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'Industry User',
  assigned_region UUID,
  industry_id UUID,
  approved_status BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sensor Data Table
CREATE TABLE IF NOT EXISTS sensor_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  pm25 NUMERIC,
  pm10 NUMERIC,
  temperature NUMERIC,
  humidity NUMERIC,
  noise_level NUMERIC,
  air_quality_ppm NUMERIC,
  co_ppm NUMERIC,
  smoke_ppm NUMERIC,
  noise_db NUMERIC,
  turbidity_ntu NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Industries Table
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_name TEXT NOT NULL,
  address TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_activity TEXT NOT NULL,
  production_starting_date DATE NOT NULL,
  production_capacity TEXT NOT NULL,
  unit TEXT NOT NULL,
  entity_name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  incorporation_date DATE NOT NULL,
  registration_number TEXT NOT NULL,
  pan_number TEXT NOT NULL,
  gst_number TEXT,
  msme_number TEXT,
  license_number TEXT,
  office_address TEXT NOT NULL,
  operational_address TEXT,
  contact_mobile TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  alternate_number TEXT,
  owner_name TEXT NOT NULL,
  owner_mobile TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  place TEXT NOT NULL,
  district TEXT NOT NULL,
  location_lat NUMERIC NOT NULL,
  location_lng NUMERIC NOT NULL,
  industry_type TEXT DEFAULT 'Other',
  emission_factor NUMERIC DEFAULT 0.5,
  regional_officer_id UUID,
  region_id UUID REFERENCES regional_offices(id),
  industry_category TEXT DEFAULT 'White',
  approval_status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Industry Forms Table
CREATE TABLE IF NOT EXISTS industry_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_reference TEXT UNIQUE NOT NULL,
  industry_id UUID REFERENCES industries(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  status TEXT DEFAULT 'Submitted',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring Stations Table
CREATE TABLE IF NOT EXISTS monitoring_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_name TEXT NOT NULL,
  location_lat NUMERIC NOT NULL,
  location_lng NUMERIC NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'Industry', 'Station', 'Complaint'
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'Low',
  status TEXT DEFAULT 'Open',
  station_id UUID REFERENCES monitoring_stations(id),
  industry_id UUID REFERENCES industries(id),
  complaint_id UUID, -- References citizen_reports later
  assigned_officer UUID REFERENCES users(id),
  region_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Regional Offices Table
CREATE TABLE IF NOT EXISTS regional_offices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_name TEXT UNIQUE NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  office_head TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring Teams Table
CREATE TABLE IF NOT EXISTS monitoring_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name TEXT UNIQUE NOT NULL,
  regional_officer_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring Team Members Junction Table
CREATE TABLE IF NOT EXISTS monitoring_team_members (
  team_id UUID REFERENCES monitoring_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, user_id)
);

-- Monitoring Logs Table
CREATE TABLE IF NOT EXISTS monitoring_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monitoring_type TEXT NOT NULL,
  location TEXT,
  value JSONB, -- Can store metrics like PM2.5, Water pH, etc.
  submitted_by UUID REFERENCES users(id),
  region_id UUID REFERENCES regional_offices(id),
  remarks TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
