-- ========================================
-- FASES LUNARES (Registros de fases)
-- ========================================

CREATE TABLE IF NOT EXISTS lunar_phases (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  phase_date DATE NOT NULL,
  moon_phase TEXT NOT NULL,
  zodiac_sign TEXT NOT NULL,
  energy_level INT,
  checks TEXT,
  observations TEXT,
  phase_energy TEXT,
  moon_intentions TEXT,
  week_intentions TEXT,
  year_intentions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lunar_phases_user_date 
  ON lunar_phases (user_id, created_at DESC);
