-- ========================================
-- PLANET TODOS - ADD PARENT_ID COLUMN
-- ========================================
-- Migration para adicionar suporte a subtarefas (parentId)

ALTER TABLE planet_todos 
  ADD COLUMN IF NOT EXISTS parent_id TEXT REFERENCES planet_todos(todo_id);

-- Índice para melhorar performance na busca de subtarefas
CREATE INDEX IF NOT EXISTS idx_planet_todos_parent_id
  ON planet_todos (user_id, parent_id);

-- Índice para buscar tarefas principais (sem pai)
CREATE INDEX IF NOT EXISTS idx_planet_todos_user_no_parent
  ON planet_todos (user_id, parent_id) WHERE parent_id IS NULL;