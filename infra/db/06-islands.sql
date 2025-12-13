-- ========================================
-- ILHAS (Sistema de ilhas)
-- ========================================

CREATE TABLE IF NOT EXISTS islands (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  island_key TEXT NOT NULL,
  title TEXT,
  tag TEXT,
  description TEXT,
  energy_level INT,
  priority INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_islands_user 
  ON islands (user_id, island_key);
