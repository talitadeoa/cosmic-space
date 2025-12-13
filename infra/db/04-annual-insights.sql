-- ========================================
-- INSIGHTS ANUAIS
-- ========================================

CREATE TABLE IF NOT EXISTS annual_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2999),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_date 
  ON annual_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_year 
  ON annual_insights (user_id, year);

ALTER TABLE annual_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_annual_per_year 
  UNIQUE (user_id, year);
