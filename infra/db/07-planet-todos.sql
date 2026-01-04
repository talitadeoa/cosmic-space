-- ========================================
-- PLANETA TODOS (tarefas do Planeta)
-- ========================================

CREATE TABLE IF NOT EXISTS planet_todos (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  todo_id TEXT NOT NULL,
  device_id TEXT,
  content TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  depth INT DEFAULT 0,
  input_type TEXT NOT NULL CHECK (input_type IN ('text', 'checkbox')),
  category TEXT,
  due_date DATE,
  island_id TEXT,
  phase TEXT CHECK (phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INT NOT NULL DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_planet_todos_user_todo
  ON planet_todos (user_id, todo_id);

CREATE INDEX IF NOT EXISTS idx_planet_todos_user
  ON planet_todos (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_planet_todos_user_deleted
  ON planet_todos (user_id, deleted_at);
