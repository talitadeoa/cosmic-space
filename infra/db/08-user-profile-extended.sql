-- ========================================
-- EXTENSÃO DE PERFIL (Campos para Rede Social)
-- Executar após 06-community.sql
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
    INSERT INTO user_profiles (user_id, posts_count)
    VALUES (NEW.author_id, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET posts_count = user_profiles.posts_count + 1;
    
    -- Adiciona pontos cósmicos por post
    UPDATE user_profiles 
    SET cosmic_points = COALESCE(cosmic_points, 0) + 10 
    WHERE user_id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles 
    SET posts_count = GREATEST(COALESCE(posts_count, 0) - 1, 0) 
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
  IF NEW.cosmic_points IS DISTINCT FROM OLD.cosmic_points THEN
    NEW.cosmic_level := calculate_cosmic_level(COALESCE(NEW.cosmic_points, 0));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cosmic_level ON user_profiles;
CREATE TRIGGER trigger_update_cosmic_level
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_cosmic_level();

-- Atualizar níveis existentes baseado nos pontos atuais
UPDATE user_profiles 
SET cosmic_level = calculate_cosmic_level(COALESCE(cosmic_points, 0))
WHERE cosmic_level IS NULL OR cosmic_level = 'lua-nova';

-- Sincronizar posts_count para perfis existentes
UPDATE user_profiles up
SET posts_count = (
  SELECT COUNT(*) 
  FROM community_posts cp 
  WHERE cp.author_id = up.user_id 
    AND cp.status = 'published'
);
