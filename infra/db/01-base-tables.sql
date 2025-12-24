-- ========================================
-- TABELAS BASE (Autenticação e Usuários)
-- ========================================

-- Tokens de autenticação
CREATE TABLE IF NOT EXISTS auth_tokens (
  token TEXT PRIMARY KEY,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens (expires_at);

-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  provider TEXT DEFAULT 'password',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- Formulários genéricos
CREATE TABLE IF NOT EXISTS form_entries (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT,
  email TEXT,
  message TEXT,
  source TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_entries_type_created_at ON form_entries (type, created_at DESC);

-- ========================================
-- INSIGHTS UNIFICADOS (Mensal, Trimestral, Anual)
-- ========================================

CREATE TABLE IF NOT EXISTS insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'annual')),
  period_value INT NOT NULL,
  year INT DEFAULT 2024,
  moon_phase TEXT CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_user_date 
  ON insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_insights_user_period 
  ON insights (user_id, period_type, period_value);

CREATE INDEX IF NOT EXISTS idx_insights_user_phase 
  ON insights (user_id, moon_phase) WHERE moon_phase IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_insights_unique 
  ON insights (user_id, period_type, period_value, year, COALESCE(moon_phase, 'none'));
