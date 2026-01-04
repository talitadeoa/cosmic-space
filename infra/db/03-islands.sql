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
  device_id TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_islands_user 
  ON islands (user_id, island_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_islands_user_key_unique
  ON islands (user_id, island_key);

CREATE INDEX IF NOT EXISTS idx_islands_user_deleted
  ON islands (user_id, deleted_at);
