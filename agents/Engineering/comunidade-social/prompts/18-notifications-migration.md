# Prompt 18: Migration - Tabela Notifications

## Objetivo
Criar tabela para notificações da comunidade.

## Contexto
- Tipos de notificação: follow, reaction, comment, mention
- Notificações devem ser lidas/não lidas
- Relacionamento com actor (quem fez a ação), post e comentário

## Instrução

Crie o arquivo `infra/db/11-community-notifications.sql`:

```sql
-- ========================================
-- SISTEMA DE NOTIFICAÇÕES
-- ========================================

CREATE TABLE IF NOT EXISTS community_notifications (
  id BIGSERIAL PRIMARY KEY,
  
  -- Quem recebe a notificação
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo da notificação
  type TEXT NOT NULL CHECK (type IN ('follow', 'reaction', 'comment', 'mention')),
  
  -- Quem realizou a ação (pode ser null se sistema)
  actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Contexto (opcional, dependendo do tipo)
  post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id BIGINT REFERENCES community_comments(id) ON DELETE CASCADE,
  
  -- Dados extras (tipo de reação, texto do mention, etc)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  read_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON community_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON community_notifications(user_id)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_actor
  ON community_notifications(actor_id);

CREATE INDEX IF NOT EXISTS idx_notifications_post
  ON community_notifications(post_id);

-- ========================================
-- TRIGGERS PARA CRIAR NOTIFICAÇÕES
-- ========================================

-- Notificação ao receber follow
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_notifications (user_id, type, actor_id)
  VALUES (NEW.following_id, 'follow', NEW.follower_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_follow ON community_follows;
CREATE TRIGGER trigger_notify_follow
AFTER INSERT ON community_follows
FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

-- Notificação ao receber reação
CREATE OR REPLACE FUNCTION notify_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_author BIGINT;
BEGIN
  -- Buscar autor do post
  SELECT author_id INTO post_author
  FROM community_posts
  WHERE id = NEW.post_id;

  -- Não notificar auto-reação
  IF post_author IS NOT NULL AND post_author <> NEW.user_id THEN
    INSERT INTO community_notifications (user_id, type, actor_id, post_id, metadata)
    VALUES (
      post_author, 
      'reaction', 
      NEW.user_id, 
      NEW.post_id,
      jsonb_build_object('reaction_type', NEW.type)
    );
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_reaction ON community_reactions;
CREATE TRIGGER trigger_notify_reaction
AFTER INSERT ON community_reactions
FOR EACH ROW EXECUTE FUNCTION notify_on_reaction();

-- Notificação ao receber comentário
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author BIGINT;
BEGIN
  -- Buscar autor do post
  SELECT author_id INTO post_author
  FROM community_posts
  WHERE id = NEW.post_id;

  -- Não notificar auto-comentário
  IF post_author IS NOT NULL AND post_author <> NEW.author_id THEN
    INSERT INTO community_notifications (user_id, type, actor_id, post_id, comment_id)
    VALUES (post_author, 'comment', NEW.author_id, NEW.post_id, NEW.id);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_comment ON community_comments;
CREATE TRIGGER trigger_notify_comment
AFTER INSERT ON community_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- ========================================
-- FUNÇÕES HELPER
-- ========================================

-- Contar notificações não lidas
CREATE OR REPLACE FUNCTION unread_notification_count(p_user_id BIGINT)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM community_notifications 
    WHERE user_id = p_user_id AND read_at IS NULL
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Marcar todas como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id BIGINT)
RETURNS INT AS $$
DECLARE
  updated_count INT;
BEGIN
  WITH updated AS (
    UPDATE community_notifications
    SET read_at = NOW()
    WHERE user_id = p_user_id AND read_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO updated_count FROM updated;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
```

## Estrutura de Notificação

| Campo | Tipo | Descrição |
|-------|------|-----------|
| user_id | BIGINT | Quem recebe a notificação |
| type | TEXT | 'follow', 'reaction', 'comment', 'mention' |
| actor_id | BIGINT | Quem fez a ação |
| post_id | BIGINT | Post relacionado (se aplicável) |
| comment_id | BIGINT | Comentário relacionado (se aplicável) |
| metadata | JSONB | Dados extras (tipo de reação, etc) |
| read_at | TIMESTAMPTZ | Quando foi lida (null = não lida) |
| created_at | TIMESTAMPTZ | Quando foi criada |

## Validação
- [ ] Tabela criada com constraints
- [ ] Índices para performance
- [ ] Trigger de follow cria notificação
- [ ] Trigger de reaction cria notificação
- [ ] Trigger de comment cria notificação
- [ ] Auto-ações não geram notificação
- [ ] Função unread_notification_count funciona
- [ ] Função mark_all_notifications_read funciona

## Teste Manual

```sql
-- Simular follow (user 1 segue user 2)
INSERT INTO community_follows (follower_id, following_id) VALUES (1, 2);

-- Verificar notificação criada para user 2
SELECT * FROM community_notifications WHERE user_id = 2;

-- Contar não lidas
SELECT unread_notification_count(2);

-- Marcar como lidas
SELECT mark_all_notifications_read(2);

-- Verificar contagem zerada
SELECT unread_notification_count(2);
```

## Próximo Passo
→ Task 5.2: API CRUD de Notificações
