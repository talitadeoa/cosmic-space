-- ========================================
-- LUNAÇÕES (Calendário lunar com signos)
-- ========================================

CREATE TABLE IF NOT EXISTS lunations (
  id BIGSERIAL PRIMARY KEY,
  lunation_date DATE NOT NULL UNIQUE,
  moon_phase TEXT NOT NULL,
  moon_emoji TEXT,
  zodiac_sign TEXT NOT NULL,
  zodiac_emoji TEXT,
  illumination DECIMAL(5, 2),
  age_days DECIMAL(6, 3),
  description TEXT,
  source TEXT DEFAULT 'generated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lunations_date ON lunations (lunation_date DESC);
CREATE INDEX IF NOT EXISTS idx_lunations_phase ON lunations (moon_phase);
CREATE INDEX IF NOT EXISTS idx_lunations_sign ON lunations (zodiac_sign);
