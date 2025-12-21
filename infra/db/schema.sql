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
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  month_number INT NOT NULL CHECK (month_number >= 1 AND month_number <= 12),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_date 
  ON monthly_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_month 
  ON monthly_insights (user_id, month_number);

CREATE INDEX IF NOT EXISTS idx_monthly_insights_user_phase 
  ON monthly_insights (user_id, moon_phase);

ALTER TABLE monthly_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_monthly_per_phase_month 
  UNIQUE (user_id, moon_phase, month_number);

-- Insights Trimestrais
CREATE TABLE IF NOT EXISTS quarterly_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  moon_phase TEXT NOT NULL CHECK (moon_phase IN ('luaNova', 'luaCrescente', 'luaCheia', 'luaMinguante')),
  quarter_number INT NOT NULL CHECK (quarter_number >= 1 AND quarter_number <= 4),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_date 
  ON quarterly_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_quarter 
  ON quarterly_insights (user_id, quarter_number);

CREATE INDEX IF NOT EXISTS idx_quarterly_insights_user_phase 
  ON quarterly_insights (user_id, moon_phase);

ALTER TABLE quarterly_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_quarterly_per_phase_quarter 
  UNIQUE (user_id, moon_phase, quarter_number);

-- Insights Anuais
CREATE TABLE IF NOT EXISTS annual_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INT NOT NULL CHECK (year >= 2000 AND year <= 2999),
  insight TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_date 
  ON annual_insights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annual_insights_user_year 
  ON annual_insights (user_id, year);

ALTER TABLE annual_insights 
  ADD CONSTRAINT IF NOT EXISTS unique_annual_per_year 
  UNIQUE (user_id, year);

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

-- Inputs por fase (energia, tarefas, rituais, etc.)
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

-- Lunações (Datas de lunações com signos)
CREATE TABLE IF NOT EXISTS lunations (
  id BIGSERIAL PRIMARY KEY,
  lunation_date DATE NOT NULL UNIQUE,
  moon_phase TEXT NOT NULL,
  zodiac_sign TEXT NOT NULL,
  illumination DECIMAL(5, 2),
  age_days DECIMAL(6, 3),
  description TEXT,
  source TEXT DEFAULT 'generated',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lunations_date ON lunations (lunation_date DESC);
CREATE INDEX IF NOT EXISTS idx_lunations_phase ON lunations (moon_phase);
CREATE INDEX IF NOT EXISTS idx_lunations_sign ON lunations (zodiac_sign);
