-- Migração 15: Tabelas de ciclos do usuário
-- Criada em: 2025-01-XX
-- Objetivo: Armazenar registros de ciclo do usuário com sincronização

-- Tabela principal de registros de ciclo
CREATE TABLE IF NOT EXISTS user_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  flow_intensity VARCHAR(20) NOT NULL CHECK (flow_intensity IN ('light', 'moderate', 'heavy')),
  symptoms TEXT[] DEFAULT '{}',
  notes TEXT,
  moon_phase VARCHAR(30),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_cycles_user_id ON user_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cycles_date ON user_cycles(date);
CREATE INDEX IF NOT EXISTS idx_user_cycles_user_date ON user_cycles(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_user_cycles_recorded_at ON user_cycles(recorded_at);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_user_cycles_updated_at ON user_cycles;
CREATE TRIGGER trigger_user_cycles_updated_at
  BEFORE UPDATE ON user_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_cycles_updated_at();

-- Comentários de documentação
COMMENT ON TABLE user_cycles IS 'Registros de ciclo do usuário com sincronização';
COMMENT ON COLUMN user_cycles.flow_intensity IS 'Intensidade do fluxo: light, moderate, heavy';
COMMENT ON COLUMN user_cycles.symptoms IS 'Array de sintomas selecionados';
COMMENT ON COLUMN user_cycles.moon_phase IS 'Fase da lua no momento do registro';
