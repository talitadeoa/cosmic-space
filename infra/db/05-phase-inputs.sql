CREATE TABLE IF NOT EXISTS phase_inputs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  input_type TEXT NOT NULL,
  source_id TEXT,
  content TEXT NOT NULL,
  vibe TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_phase_inputs_user_phase
  ON phase_inputs (user_id, moon_phase, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_phase_inputs_source_unique
  ON phase_inputs (user_id, input_type, source_id);
