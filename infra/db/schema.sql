-- Tabelas mínimas para persistir sessões e formulários no Neon (PostgreSQL)

CREATE TABLE IF NOT EXISTS auth_tokens (
  token TEXT PRIMARY KEY,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens (expires_at);

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

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  provider TEXT DEFAULT 'password',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- Insights Mensais
CREATE TABLE IF NOT EXISTS monthly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL,
  month_number INT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_date 
  ON monthly_insights (user_id, created_at DESC);

-- Insights Trimestrais
CREATE TABLE IF NOT EXISTS quarterly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_date 
  ON quarterly_insights (user_id, created_at DESC);

-- Insights Anuais
CREATE TABLE IF NOT EXISTS annual_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  insight TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_date 
  ON annual_insights (user_id, created_at DESC);

-- Fases Lunares
CREATE TABLE IF NOT EXISTS lunar_phases (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  phase_date DATE NOT NULL,
  moon_phase TEXT NOT NULL,
  zodiac_sign TEXT NOT NULL,
  energy_level INT,
  checks TEXT,
  observations TEXT,
  phase_energy TEXT,
  moon_intentions TEXT,
  week_intentions TEXT,
  year_intentions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lunar_phases_user_date 
  ON lunar_phases (user_id, created_at DESC);

-- Ilhas
CREATE TABLE IF NOT EXISTS islands (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  island_key TEXT NOT NULL,
  title TEXT,
  tag TEXT,
  description TEXT,
  energy_level INT,
  priority INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_islands_user 
  ON islands (user_id, island_key);

