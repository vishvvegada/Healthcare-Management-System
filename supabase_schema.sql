-- ==========================================
-- HOSPITAL MANAGEMENT SYSTEM SCHEMA
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Create Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

-- Insert required roles
INSERT INTO roles (name) VALUES 
  ('super_admin'), 
  ('hospital_admin'), 
  ('doctor'), 
  ('receptionist'), 
  ('pharmacy_manager'), 
  ('patient'), 
  ('lab_manager')
ON CONFLICT (name) DO NOTHING;

-- 3. Create Users Table (links to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role_id INT REFERENCES roles(id),
  hospital_id INT REFERENCES hospitals(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hospital_id INT REFERENCES hospitals(id),
  specialization VARCHAR(255) DEFAULT 'General',
  morning_start TIME DEFAULT '09:00:00',
  morning_end TIME DEFAULT '13:00:00',
  evening_start TIME DEFAULT '14:00:00',
  evening_end TIME DEFAULT '18:00:00',
  available_dates JSONB DEFAULT '[]',
  working_days JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  age INT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create Time Slots Table
CREATE TABLE IF NOT EXISTS time_slots (
  id SERIAL PRIMARY KEY,
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  slot_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  UNIQUE(doctor_id, slot_time)
);

-- 7. Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  slot_id INT REFERENCES time_slots(id),
  status VARCHAR(50) DEFAULT 'booked',
  visit_type VARCHAR(20) DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, appointment_date, slot_id) -- Prevents double booking
);

-- 8. Create Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create Prescription Medicines Table
CREATE TABLE IF NOT EXISTS prescription_medicines (
  id SERIAL PRIMARY KEY,
  prescription_id INT REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  before_meal BOOLEAN DEFAULT FALSE
);

-- 10. Create Prescription Injections Table
CREATE TABLE IF NOT EXISTS prescription_injections (
  id SERIAL PRIMARY KEY,
  prescription_id INT REFERENCES prescriptions(id) ON DELETE CASCADE,
  injection_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(50) NOT NULL,
  route VARCHAR(50) DEFAULT 'IM'
);

-- 11. Create Lab Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id INT REFERENCES doctors(id) ON DELETE CASCADE,
  prescription_id INT REFERENCES prescriptions(id) ON DELETE CASCADE,
  report_name VARCHAR(255) NOT NULL,
  result TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- VERY IMPORTANT: DISABLE ROW LEVEL SECURITY (RLS) FOR DEVELOPMENT
-- Or create appropriate policies if you intend to go to production.
-- For this prototype to work seamlessly, we will disable RLS on these tables.
-- ==========================================
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medicines DISABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_injections DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
