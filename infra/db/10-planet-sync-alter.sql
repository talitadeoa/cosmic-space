-- ========================================
-- PLANETA SYNC - ALTERACOES
-- ========================================

ALTER TABLE planet_todos
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_planet_todos_user_deleted
  ON planet_todos (user_id, deleted_at);

ALTER TABLE planet_state
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;
