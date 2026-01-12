# Prompt 06: Migration - Tabela Follows

## Objetivo
Criar a tabela de relacionamento de seguidores para o sistema de follows.

## Contexto
- Dependência: Fase 1 (Perfil Público) deve estar completa
- Campos `followers_count` e `following_count` já existem em `user_profiles`

## Instrução

Crie o arquivo `infra/db/09-community-follows.sql`:

```sql
-- ========================================
-- SISTEMA DE FOLLOWS (Seguidores)
-- ========================================

CREATE TABLE IF NOT EXISTS community_follows (
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  -- Não pode seguir a si mesmo
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- Índices para queries eficientes
CREATE INDEX IF NOT EXISTS idx_follows_follower 
  ON community_follows(follower_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_follows_following 
  ON community_follows(following_id, created_at DESC);

-- Trigger para atualizar contadores automaticamente
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementa following_count do seguidor
    UPDATE user_profiles 
    SET following_count = COALESCE(following_count, 0) + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Incrementa followers_count do seguido
    UPDATE user_profiles 
    SET followers_count = COALESCE(followers_count, 0) + 1 
    WHERE user_id = NEW.following_id;
    
    -- Adiciona pontos cósmicos para quem foi seguido
    UPDATE user_profiles 
    SET cosmic_points = COALESCE(cosmic_points, 0) + 5 
    WHERE user_id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementa following_count do seguidor
    UPDATE user_profiles 
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) 
    WHERE user_id = OLD.follower_id;
    
    -- Decrementa followers_count do seguido
    UPDATE user_profiles 
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) 
    WHERE user_id = OLD.following_id;
    
    -- Remove pontos cósmicos (opcional, pode comentar se não quiser)
    UPDATE user_profiles 
    SET cosmic_points = GREATEST(COALESCE(cosmic_points, 0) - 5, 0) 
    WHERE user_id = OLD.following_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_follow_counts ON community_follows;
CREATE TRIGGER trigger_follow_counts
AFTER INSERT OR DELETE ON community_follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Função helper para verificar se A segue B
CREATE OR REPLACE FUNCTION is_following(follower BIGINT, target BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM community_follows 
    WHERE follower_id = follower AND following_id = target
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

## Validação
- [ ] Tabela criada com constraints
- [ ] Não permite auto-follow (self follow)
- [ ] Índices para performance
- [ ] Trigger atualiza contadores
- [ ] Pontos cósmicos são adicionados/removidos

## Teste Manual

```sql
-- Inserir follow (user 1 segue user 2)
INSERT INTO community_follows (follower_id, following_id) VALUES (1, 2);

-- Verificar contadores atualizados
SELECT user_id, followers_count, following_count 
FROM user_profiles 
WHERE user_id IN (1, 2);

-- Verificar função helper
SELECT is_following(1, 2); -- true
SELECT is_following(2, 1); -- false

-- Remover follow
DELETE FROM community_follows WHERE follower_id = 1 AND following_id = 2;

-- Verificar contadores decrementados
SELECT user_id, followers_count, following_count 
FROM user_profiles 
WHERE user_id IN (1, 2);
```

## Próximo Passo
→ Task 2.2: API Seguir/Deixar de Seguir
