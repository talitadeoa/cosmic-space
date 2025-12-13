-- ========================================
-- INSIGHTS TRIMESTRAIS (Estações/Trimestres)
-- ========================================

CREATE TABLE IF NOT EXISTS quarterly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  quarter_number INT NOT NULL CHECK (quarter_number >= 1 AND quarter_number <= 4),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_date 
  ON quarterly_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_quarter 
  ON quarterly_insights (user_id, quarter_number);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_phase 
  ON quarterly_insights (user_id, moon_phase);

ALTER TABLE quarterly_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_quarterly_per_phase_quarter 
  UNIQUE (user_id, moon_phase, quarter_number);
