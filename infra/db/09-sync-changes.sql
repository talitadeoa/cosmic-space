-- ========================================
-- SYNC CHANGES (log de mudanças)
-- ========================================

CREATE TABLE IF NOT EXISTS sync_changes (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('planet_todo', 'planet_state')),
  entity_id TEXT NOT NULL,
  change_id TEXT NOT NULL,
  base_version INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_changes_change
  ON sync_changes (user_id, device_id, change_id);

CREATE INDEX IF NOT EXISTS idx_sync_changes_user_created
  ON sync_changes (user_id, created_at DESC);
