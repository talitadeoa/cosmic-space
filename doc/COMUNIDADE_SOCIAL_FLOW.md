# COMUNIDADE_SOCIAL_FLOW

## Objetivo
Dar ao /comunidade uma dinamica social clara: seguir pessoas, mencionar e receber notificacoes.

## Fluxos

### Follow
1. UI: botao "Seguir" no card do post e no perfil.
2. Estados: seguindo / nao seguindo / solicitado (se perfis privados entrarem).
3. Acoes: POST /api/community/follows { userId }, DELETE /api/community/follows/:userId
4. Efeitos: atualiza feed "Seguindo", recomenda conexoes, gera notificacao de follow.

### Mencoes
1. UI: autocomplete ao digitar @ no composer e nos comentarios.
2. Parser: extrair handles no backend ao salvar post/comentario.
3. Resolver: GET /api/community/mentions/resolve?q=... para sugestoes.
4. Notificacao: tipo mention com contexto (postId/commentId).

### Notificacoes
1. Tipos: follow, mention, comment, reply, reaction, repost.
2. Centro: sino no header abre drawer/lista; badge de nao lidos.
3. Estado: nao lido -> agrupamento; lido -> historico.
4. Preferencias: mute por topico, quiet hours, receber apenas mencoes.

## Dados sugeridos (DB)
- community_follows (follower_id, following_id, created_at)
- community_notifications (id, user_id, type, actor_id, entity_type, entity_id, read_at, created_at, payload_json)
- community_user_handles (user_id, handle)
- community_mentions (id, mentioned_user_id, actor_id, entity_type, entity_id, created_at)

## Regras e protecoes
- Evitar auto-follow.
- Deduplicar notificacoes repetidas em janela curta.
- Mencoes so para usuarios existentes.
- Limitar notificacoes por minuto para evitar spam.

## Integracao com UI atual
- CommunityHeader: badge no sino + menu rapido de notificacoes.
- PostCard: botao seguir autor + destaque para posts com mencoes.
- NewPostForm/QuickComposer: autocomplete e highlight de @handles.
