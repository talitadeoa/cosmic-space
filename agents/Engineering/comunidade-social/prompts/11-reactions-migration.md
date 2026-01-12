# Prompt 11: Migration - Tabela Reactions

## Objetivo
Criar tabela para persistir reações dos usuários nos posts.

## Contexto
- Atualmente reações são apenas em estado local
- Sistema de pontos cósmicos já existe
- Tipos de reação: energia, apoio, lua, estrela

## Instrução

Crie o arquivo `infra/db/10-community-reactions.sql`:

```sql
-- ========================================
-- SISTEMA DE REAÇÕES PERSISTENTES
-- ========================================

CREATE TABLE IF NOT EXISTS community_reactions (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('energia', 'apoio', 'lua', 'estrela')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Cada usuário só pode ter uma reação de cada tipo por post
  UNIQUE(post_id, user_id, type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reactions_post 
  ON community_reactions(post_id);

CREATE INDEX IF NOT EXISTS idx_reactions_user 
  ON community_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_reactions_post_type 
  ON community_reactions(post_id, type);

-- View para contagem de reações por post
CREATE OR REPLACE VIEW community_post_reaction_counts AS
SELECT 
  post_id,
  COUNT(*) FILTER (WHERE type = 'energia') AS energia_count,
  COUNT(*) FILTER (WHERE type = 'apoio') AS apoio_count,
  COUNT(*) FILTER (WHERE type = 'lua') AS lua_count,
  COUNT(*) FILTER (WHERE type = 'estrela') AS estrela_count,
  COUNT(*) AS total_count
FROM community_reactions
GROUP BY post_id;

-- Trigger para dar pontos cósmicos ao autor quando recebe reação
CREATE OR REPLACE FUNCTION on_reaction_change()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id BIGINT;
  points_change INT;
BEGIN
  -- Buscar autor do post
  SELECT author_id INTO post_author_id 
  FROM community_posts 
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);

  -- Não dar pontos para si mesmo
  IF post_author_id = COALESCE(NEW.user_id, OLD.user_id) THEN
    RETURN NULL;
  END IF;

  -- Definir pontos por tipo de reação
  points_change := CASE COALESCE(NEW.type, OLD.type)
    WHEN 'estrela' THEN 5
    WHEN 'lua' THEN 3
    WHEN 'energia' THEN 2
    WHEN 'apoio' THEN 2
    ELSE 1
  END;

  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles 
    SET cosmic_points = COALESCE(cosmic_points, 0) + points_change 
    WHERE user_id = post_author_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles 
    SET cosmic_points = GREATEST(COALESCE(cosmic_points, 0) - points_change, 0) 
    WHERE user_id = post_author_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reaction_points ON community_reactions;
CREATE TRIGGER trigger_reaction_points
AFTER INSERT OR DELETE ON community_reactions
FOR EACH ROW EXECUTE FUNCTION on_reaction_change();

-- Função para obter reações de um usuário em um post
CREATE OR REPLACE FUNCTION get_user_reactions(p_post_id BIGINT, p_user_id BIGINT)
RETURNS TEXT[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT type 
    FROM community_reactions 
    WHERE post_id = p_post_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

## Validação
- [ ] Tabela criada com constraints
- [ ] Índices para performance
- [ ] Constraint UNIQUE funciona (não duplica reação)
- [ ] View de contagens funciona
- [ ] Trigger de pontos cósmicos funciona
- [ ] Não dá pontos para auto-reação

## Teste Manual

```sql
-- Adicionar reação (user 1 reage ao post 1)
INSERT INTO community_reactions (post_id, user_id, type) VALUES (1, 1, 'energia');

-- Tentar duplicar (deve falhar)
INSERT INTO community_reactions (post_id, user_id, type) VALUES (1, 1, 'energia');
-- ERROR: duplicate key value violates unique constraint

-- Verificar contagens via view
SELECT * FROM community_post_reaction_counts WHERE post_id = 1;

-- Verificar reações de um usuário
SELECT get_user_reactions(1, 1);
-- ARRAY['energia']

-- Adicionar outra reação
INSERT INTO community_reactions (post_id, user_id, type) VALUES (1, 1, 'apoio');
SELECT get_user_reactions(1, 1);
-- ARRAY['energia', 'apoio']

-- Remover reação
DELETE FROM community_reactions WHERE post_id = 1 AND user_id = 1 AND type = 'energia';
```

## Próximo Passo
→ Task 3.2: API de Reações
