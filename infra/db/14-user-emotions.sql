-- ========================================
-- TABELA DE EMOÇÕES DO USUÁRIO
-- ========================================
-- Armazena registros emocionais vinculados à conta logada

CREATE TABLE IF NOT EXISTS user_emotions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Dados da emoção
  emotion_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT,
  description TEXT,
  
  -- Contexto opcional
  context TEXT,           -- fase lunar, energia, etc
  notes TEXT,             -- notas do usuário
  
  -- Metadados
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- quando foi registrado
  date DATE NOT NULL DEFAULT CURRENT_DATE,         -- data do registro
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca eficiente
CREATE INDEX IF NOT EXISTS idx_user_emotions_user_id 
  ON user_emotions (user_id);

CREATE INDEX IF NOT EXISTS idx_user_emotions_user_date 
  ON user_emotions (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_user_emotions_user_recorded 
  ON user_emotions (user_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_emotions_emotion_id 
  ON user_emotions (user_id, emotion_id);

-- Tabela de emoção atual (última emoção selecionada)
CREATE TABLE IF NOT EXISTS user_current_emotion (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Dados da emoção atual
  emotion_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  label TEXT NOT NULL,
  color TEXT,
  description TEXT,
  
  -- Metadados
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_current_emotion_user_id 
  ON user_current_emotion (user_id);

-- ========================================
-- FUNÇÕES AUXILIARES
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_emotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_emotions
DROP TRIGGER IF EXISTS trigger_user_emotions_updated_at ON user_emotions;
CREATE TRIGGER trigger_user_emotions_updated_at
  BEFORE UPDATE ON user_emotions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_emotions_updated_at();

-- Trigger para user_current_emotion
DROP TRIGGER IF EXISTS trigger_user_current_emotion_updated_at ON user_current_emotion;
CREATE TRIGGER trigger_user_current_emotion_updated_at
  BEFORE UPDATE ON user_current_emotion
  FOR EACH ROW
  EXECUTE FUNCTION update_user_emotions_updated_at();
