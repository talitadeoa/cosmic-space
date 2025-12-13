-- ========================================
-- INSIGHTS MENSAIS
-- ========================================

CREATE TABLE IF NOT EXISTS monthly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  month_number INT NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_date 
  ON monthly_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_month 
  ON monthly_insights (user_id, month_number);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_phase 
  ON monthly_insights (user_id, moon_phase);

ALTER TABLE monthly_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_monthly_per_phase_month 
  UNIQUE (user_id, moon_phase, month_number);
