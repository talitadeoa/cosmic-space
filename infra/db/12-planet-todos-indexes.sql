-- ========================================
-- PLANETA TODOS - INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_planet_todos_user_island
  ON planet_todos (user_id, island_id);

CREATE INDEX IF NOT EXISTS idx_planet_todos_user_phase
  ON planet_todos (user_id, phase);

CREATE INDEX IF NOT EXISTS idx_planet_todos_user_due_date
  ON planet_todos (user_id, due_date);

CREATE INDEX IF NOT EXISTS idx_planet_todos_user_input_type
  ON planet_todos (user_id, input_type);

CREATE INDEX IF NOT EXISTS idx_planet_todos_user_completed
  ON planet_todos (user_id, completed);
