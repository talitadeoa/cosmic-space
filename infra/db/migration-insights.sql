-- ============================================================
-- SCRIPT: Criar/Atualizar Tabelas de Insights no Neon
-- ============================================================
-- Use este script para executar todas as operações de banco
-- para os três tipos de insights (mensal, trimestral, anual)
-- ============================================================

-- Verificar se a tabela users existe (requisito)
-- Se não existir, criar:
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  provider TEXT DEFAULT 'password',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- ============================================================
-- 1. INSIGHTS MENSAIS
-- ============================================================
-- Um insight por fase lunar, por mês
-- Exemplo: Lua Nova em Janeiro, Lua Crescente em Janeiro, etc

CREATE TABLE IF NOT EXISTS monthly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  month_number INT NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_date 
  ON monthly_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_month 
  ON monthly_insights (user_id, month_number);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_phase 
  ON monthly_insights (user_id, moon_phase);

-- Constraint de unicidade: um insight por fase por mês
-- (Nota: Se a tabela já existe, esta operação pode falhar)
-- Para adicionar depois, use:
-- ALTER TABLE monthly_insights 
--   ADD CONSTRAINT unique_monthly_per_phase_month 
--   UNIQUE (user_id, moon_phase, month_number);

-- ============================================================
-- 2. INSIGHTS TRIMESTRAIS
-- ============================================================
-- Um insight por fase lunar, por trimestre
-- Exemplo: Lua Nova no Q1, Lua Crescente no Q1, etc
-- Q1: Jan-Mar, Q2: Abr-Jun, Q3: Jul-Set, Q4: Out-Dez

CREATE TABLE IF NOT EXISTS quarterly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  quarter_number INT NOT NULL CHECK (quarter_number >= 1 AND quarter_number <= 4),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_date 
  ON quarterly_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_quarter 
  ON quarterly_insights (user_id, quarter_number);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_phase 
  ON quarterly_insights (user_id, moon_phase);

-- Constraint de unicidade: um insight por fase por trimestre
-- ALTER TABLE quarterly_insights 
--   ADD CONSTRAINT unique_quarterly_per_phase_quarter 
--   UNIQUE (user_id, moon_phase, quarter_number);

-- ============================================================
-- 3. INSIGHTS ANUAIS
-- ============================================================
-- Um insight por ano
-- Exemplo: 1 insight em 2024, 1 em 2025, etc

CREATE TABLE IF NOT EXISTS annual_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2999),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_annual_insights_user_date 
  ON annual_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_year 
  ON annual_insights (user_id, year);

-- Constraint de unicidade: um insight por ano
-- ALTER TABLE annual_insights 
--   ADD CONSTRAINT unique_annual_per_year 
--   UNIQUE (user_id, year);

-- ============================================================
-- ADICIONAR CONSTRAINTS DE UNICIDADE (se não existirem)
-- ============================================================
-- Descomente estas linhas se as tabelas já existem e você 
-- quer adicionar os constraints:

/*
ALTER TABLE monthly_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_monthly_per_phase_month 
  UNIQUE (user_id, moon_phase, month_number);

ALTER TABLE quarterly_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_quarterly_per_phase_quarter 
  UNIQUE (user_id, moon_phase, quarter_number);

ALTER TABLE annual_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_annual_per_year 
  UNIQUE (user_id, year);
*/

-- ============================================================
-- VERIFICAR ESTRUTURA (SELECT não faz alterações)
-- ============================================================

-- Verificar se as tabelas foram criadas
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name IN ('monthly_insights', 'quarterly_insights', 'annual_insights');

-- Verificar colunas da tabela monthly_insights
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'monthly_insights'
-- ORDER BY ordinal_position;

-- Verificar índices
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename IN ('monthly_insights', 'quarterly_insights', 'annual_insights');

-- ============================================================
-- EXEMPLOS DE INSERT (para testar)
-- ============================================================

-- Inserir um insight mensal
-- INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
-- VALUES (1, 'luaNova', 1, 'Meu insight para janeiro na lua nova')
-- ON CONFLICT (user_id, moon_phase, month_number) 
-- DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Inserir um insight trimestral
-- INSERT INTO quarterly_insights (user_id, moon_phase, quarter_number, insight)
-- VALUES (1, 'luaNova', 1, 'Meu insight trimestral para Q1')
-- ON CONFLICT (user_id, moon_phase, quarter_number)
-- DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Inserir um insight anual
-- INSERT INTO annual_insights (user_id, year, insight)
-- VALUES (1, 2024, 'Meu insight para 2024')
-- ON CONFLICT (user_id, year)
-- DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- ============================================================
-- QUERIES ÚTEIS
-- ============================================================

-- Obter todos os insights mensais de um usuário em um mês
-- SELECT * FROM monthly_insights
-- WHERE user_id = 1 AND month_number = 1
-- ORDER BY 
--   CASE 
--     WHEN moon_phase = 'luaNova' THEN 1
--     WHEN moon_phase = 'luaCrescente' THEN 2
--     WHEN moon_phase = 'luaCheia' THEN 3
--     WHEN moon_phase = 'luaMinguante' THEN 4
--   END;

-- Obter todos os insights trimestrais de um usuário em um trimestre
-- SELECT * FROM quarterly_insights
-- WHERE user_id = 1 AND quarter_number = 1
-- ORDER BY 
--   CASE 
--     WHEN moon_phase = 'luaNova' THEN 1
--     WHEN moon_phase = 'luaCrescente' THEN 2
--     WHEN moon_phase = 'luaCheia' THEN 3
--     WHEN moon_phase = 'luaMinguante' THEN 4
--   END;

-- Obter insight anual de um usuário
-- SELECT * FROM annual_insights
-- WHERE user_id = 1 AND year = 2024;

-- Listar todos os insights de um usuário (combinado)
-- SELECT 
--   'mensal'::TEXT as tipo,
--   moon_phase,
--   month_number::TEXT as periodo,
--   insight,
--   created_at
-- FROM monthly_insights
-- WHERE user_id = 1
-- UNION ALL
-- SELECT 
--   'trimestral'::TEXT,
--   moon_phase,
--   quarter_number::TEXT,
--   insight,
--   created_at
-- FROM quarterly_insights
-- WHERE user_id = 1
-- UNION ALL
-- SELECT 
--   'anual'::TEXT,
--   NULL as moon_phase,
--   year::TEXT,
--   insight,
--   created_at
-- FROM annual_insights
-- WHERE user_id = 1
-- ORDER BY created_at DESC;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
