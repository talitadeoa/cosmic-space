-- ========================================
-- PLANET STATE (estado UI do Planeta)
-- ========================================

CREATE TABLE IF NOT EXISTS planet_state (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_planet_state_user
  ON planet_state (user_id);
