# Prompt 01: Migration - Campos Extras do Perfil

## Objetivo
Criar migration SQL para estender a tabela `user_profiles` com campos necessários para o perfil público expandido.

## Contexto
- Schema atual em `infra/db/06-community.sql`
- Tabela `user_profiles` já existe com: `user_id`, `display_name`, `avatar_url`, `bio`, `created_at`, `updated_at`

## Instrução

Crie o arquivo `infra/db/08-user-profile-extended.sql` com:

```sql
-- ========================================
-- EXTENSÃO DE PERFIL (Campos para Rede Social)
-- ========================================

-- Novos campos para perfil expandido
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  lunar_sign TEXT;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  cosmic_level TEXT DEFAULT 'lua-nova'
    CHECK (cosmic_level IN ('lua-nova', 'quarto-crescente', 'lua-cheia', 'estrela-guia'));

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  cosmic_points INT DEFAULT 0;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  posts_count INT DEFAULT 0;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  followers_count INT DEFAULT 0;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  following_count INT DEFAULT 0;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  streak_days INT DEFAULT 0;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Índice para ranking/leaderboard
CREATE INDEX IF NOT EXISTS idx_user_profiles_cosmic_points 
  ON user_profiles (cosmic_points DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_cosmic_level 
  ON user_profiles (cosmic_level);

-- Trigger para atualizar posts_count automaticamente
CREATE OR REPLACE FUNCTION update_user_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles 
    SET posts_count = posts_count + 1 
    WHERE user_id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles 
    SET posts_count = GREATEST(posts_count - 1, 0) 
    WHERE user_id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_posts_count ON community_posts;
CREATE TRIGGER trigger_update_posts_count
AFTER INSERT OR DELETE ON community_posts
FOR EACH ROW EXECUTE FUNCTION update_user_posts_count();

-- Função para calcular nível cósmico baseado em pontos
CREATE OR REPLACE FUNCTION calculate_cosmic_level(points INT)
RETURNS TEXT AS $$
BEGIN
  IF points >= 2000 THEN
    RETURN 'estrela-guia';
  ELSIF points >= 500 THEN
    RETURN 'lua-cheia';
  ELSIF points >= 100 THEN
    RETURN 'quarto-crescente';
  ELSE
    RETURN 'lua-nova';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para atualizar nível automaticamente quando pontos mudam
CREATE OR REPLACE FUNCTION update_cosmic_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cosmic_points <> OLD.cosmic_points THEN
    NEW.cosmic_level := calculate_cosmic_level(NEW.cosmic_points);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cosmic_level ON user_profiles;
CREATE TRIGGER trigger_update_cosmic_level
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_cosmic_level();
```

## Validação
- [ ] Arquivo criado em `infra/db/08-user-profile-extended.sql`
- [ ] Campos adicionados corretamente
- [ ] Triggers funcionando
- [ ] Índices criados

## Próximo Passo
→ Task 1.2: API de Perfil Público
