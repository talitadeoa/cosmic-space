-- ========================================
-- ILHAS SYNC - ALTERACOES
-- ========================================

ALTER TABLE sync_changes
  DROP CONSTRAINT IF EXISTS sync_changes_entity_type_check;

ALTER TABLE sync_changes
  ADD CONSTRAINT sync_changes_entity_type_check
  CHECK (entity_type IN ('planet_todo', 'planet_state', 'island'));

ALTER TABLE islands
  ADD COLUMN IF NOT EXISTS device_id TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_islands_user_deleted
  ON islands (user_id, deleted_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_islands_user_key_unique
  ON islands (user_id, island_key);
