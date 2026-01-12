# 🌙 Comunidade - Transformação em Rede Social

> Planejamento completo para transformar `/comunidade` em uma experiência social vibrante e engajante.

---

## 📋 Visão Geral

### Status Atual
- [x] Feed de posts básico
- [x] Comentários
- [x] Tags e filtros
- [x] Reações locais (não persistidas)
- [x] Busca
- [x] Trending topics (estático)
- [x] Membros ativos (estático)

### Objetivo
Criar uma rede social temática lunar com conexões entre usuários, engajamento real e gamificação alinhada ao conceito cósmico.

---

## 🚀 FASE 1: Perfil Público Expandido

### Task 1.1: Schema do Banco de Dados
**Arquivo:** `infra/db/06-community.sql`

```sql
-- Adicionar campos ao user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  lunar_sign TEXT; -- signo lunar do usuário

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  joined_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  cosmic_level TEXT DEFAULT 'lua-nova'
    CHECK (cosmic_level IN ('lua-nova', 'quarto-crescente', 'lua-cheia', 'estrela-guia'));

-- Contadores desnormalizados para performance
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  posts_count INT DEFAULT 0;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  followers_count INT DEFAULT 0;

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS
  following_count INT DEFAULT 0;
```

### Task 1.2: API de Perfil Público
**Arquivo:** `app/api/community/profile/[userId]/route.ts`

```typescript
// GET /api/community/profile/:userId
// Retorna:
{
  profile: {
    userId: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    lunarSign: string | null;
    cosmicLevel: 'lua-nova' | 'quarto-crescente' | 'lua-cheia' | 'estrela-guia';
    joinedAt: string;
    stats: {
      postsCount: number;
      followersCount: number;
      followingCount: number;
    };
    isFollowing: boolean; // se o usuário logado segue este perfil
  };
  recentPosts: CommunityPost[]; // últimos 5 posts
}
```

### Task 1.3: Página de Perfil Público
**Arquivo:** `app/comunidade/perfil/[userId]/page.tsx`

```
Componentes:
├── ProfileHeader (avatar grande, nome, bio, stats)
├── ProfileStats (posts, seguidores, seguindo)
├── FollowButton (seguir/deixar de seguir)
├── CosmicLevelBadge (nível + progresso)
├── ProfileTabs (posts, curtidas, salvos)
└── ProfilePostsList (grid de posts do usuário)
```

### Task 1.4: Componentes de UI
**Arquivos em:** `app/comunidade/components/profile/`

```
profile/
├── ProfileHeader.tsx      - Header com avatar, nome, bio
├── ProfileStats.tsx       - Contadores clicáveis
├── FollowButton.tsx       - Botão seguir com estados
├── CosmicLevelBadge.tsx   - Badge de nível cósmico
├── ProfileTabs.tsx        - Tabs de navegação
├── ProfilePostGrid.tsx    - Grid de posts
└── index.ts               - Exports
```

---

## 🔗 FASE 2: Sistema de Follows

### Task 2.1: Schema do Banco
**Arquivo:** `infra/db/08-community-follows.sql`

```sql
CREATE TABLE IF NOT EXISTS community_follows (
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id) -- não pode seguir a si mesmo
);

CREATE INDEX idx_follows_follower ON community_follows(follower_id);
CREATE INDEX idx_follows_following ON community_follows(following_id);

-- Trigger para atualizar contadores
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
    UPDATE user_profiles SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET following_count = following_count - 1 WHERE user_id = OLD.follower_id;
    UPDATE user_profiles SET followers_count = followers_count - 1 WHERE user_id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_follow_counts
AFTER INSERT OR DELETE ON community_follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
```

### Task 2.2: API de Follows
**Arquivo:** `app/api/community/follows/route.ts`

```typescript
// POST /api/community/follows
// Body: { userId: string }
// Ação: Seguir usuário

// DELETE /api/community/follows
// Body: { userId: string }
// Ação: Deixar de seguir
```

**Arquivo:** `app/api/community/follows/[userId]/route.ts`

```typescript
// GET /api/community/follows/:userId?type=followers|following
// Retorna lista paginada de seguidores ou seguindo
```

### Task 2.3: Feed "Seguindo"
**Modificar:** `app/api/community/posts/route.ts`

```typescript
// GET /api/community/posts?feed=following
// Filtra posts apenas de quem o usuário segue
```

---

## ❤️ FASE 3: Reações Persistentes

### Task 3.1: Schema do Banco
**Arquivo:** `infra/db/09-community-reactions.sql`

```sql
CREATE TABLE IF NOT EXISTS community_reactions (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('energia', 'apoio', 'lua', 'estrela')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, type)
);

CREATE INDEX idx_reactions_post ON community_reactions(post_id);
CREATE INDEX idx_reactions_user ON community_reactions(user_id);
```

### Task 3.2: API de Reações
**Arquivo:** `app/api/community/posts/[id]/reactions/route.ts`

```typescript
// POST - Adicionar reação
// DELETE - Remover reação
// GET - Listar reações do post (com contagem por tipo)
```

### Task 3.3: Atualizar PostCard
**Modificar:** `app/comunidade/components/PostCard.tsx`

- Buscar reações reais do usuário
- Animação ao reagir
- Mostrar se usuário já reagiu

---

## 🔔 FASE 4: Notificações

### Task 4.1: Schema do Banco
**Arquivo:** `infra/db/10-community-notifications.sql`

```sql
CREATE TABLE IF NOT EXISTS community_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'reaction', 'comment', 'mention')),
  actor_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id BIGINT REFERENCES community_comments(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON community_notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON community_notifications(user_id) WHERE read_at IS NULL;
```

### Task 4.2: API de Notificações
**Arquivo:** `app/api/community/notifications/route.ts`

```typescript
// GET - Listar notificações (paginado)
// POST - Marcar como lida
// GET /count - Contador de não lidas
```

### Task 4.3: Componente de Notificações
**Arquivo:** `app/comunidade/components/NotificationBell.tsx`

- Badge com contador
- Dropdown com lista
- Marcar como lida ao clicar

---

## 📊 FASE 5: Gamificação (Níveis Cósmicos)

### Task 5.1: Sistema de Pontos
```
Ações e pontos:
- Criar post: +10 pts
- Receber reação: +2 pts
- Comentar: +5 pts
- Receber comentário: +3 pts
- Seguidor novo: +5 pts
- Dias consecutivos: +1 pt/dia (streak)
```

### Task 5.2: Níveis
```
🌑 Lua Nova: 0-99 pts (iniciante)
🌓 Quarto Crescente: 100-499 pts (engajado)
🌕 Lua Cheia: 500-1999 pts (ativo)
⭐ Estrela Guia: 2000+ pts (referência)
```

### Task 5.3: Badges Especiais
```
🌿 Ritualista: 10+ posts sobre rituais
💫 Mentor(a): 50+ comentários ajudando outros
🔥 Streak Master: 30 dias consecutivos
🌙 Lunático(a): Postou em todas as fases lunares
```

---

## 🎯 Prompts para Implementação

### Prompt 1: Perfil Público (Fase 1)
```
Implemente o sistema de perfil público expandido para a comunidade:

1. Crie a migration SQL em infra/db/08-user-profile-extended.sql com:
   - Campos: lunar_sign, cosmic_level, joined_at, posts_count, followers_count, following_count
   - Trigger para atualizar posts_count automaticamente

2. Crie a API em app/api/community/profile/[userId]/route.ts:
   - GET retorna perfil público + últimos 5 posts + isFollowing
   - Incluir contadores e nível cósmico

3. Crie a página app/comunidade/perfil/[userId]/page.tsx:
   - Layout mobile-first seguindo o padrão visual existente
   - Header com avatar grande (80px), nome, bio, signo lunar
   - Stats clicáveis (posts, seguidores, seguindo)
   - Botão seguir/seguindo (preparar para Fase 2)
   - Badge de nível cósmico com tooltip
   - Lista de posts do usuário

4. Crie componentes em app/comunidade/components/profile/:
   - ProfileHeader, ProfileStats, CosmicLevelBadge, ProfilePostGrid

5. Adicione link para perfil ao clicar no avatar/nome nos PostCards

Use o design system existente (cores slate/indigo, bordas arredondadas, glassmorphism).
```

### Prompt 2: Sistema de Follows (Fase 2)
```
Implemente o sistema de seguir usuários:

1. Crie a migration SQL infra/db/09-community-follows.sql:
   - Tabela community_follows (follower_id, following_id, created_at)
   - Índices para performance
   - Trigger para atualizar contadores em user_profiles

2. Crie APIs:
   - POST/DELETE /api/community/follows (seguir/deixar de seguir)
   - GET /api/community/follows/[userId]?type=followers|following (lista paginada)

3. Implemente FollowButton em app/comunidade/components/profile/FollowButton.tsx:
   - Estados: não-segue, seguindo, carregando
   - Animação ao clicar
   - Atualiza contador otimisticamente

4. Modifique GET /api/community/posts para aceitar ?feed=following:
   - Filtra posts de quem o usuário segue
   - Fallback para feed geral se não segue ninguém

5. Adicione tabs "Para você" e "Seguindo" no feed principal da comunidade
```

### Prompt 3: Reações Persistentes (Fase 3)
```
Implemente reações persistentes nos posts:

1. Crie migration infra/db/10-community-reactions.sql:
   - Tabela community_reactions (post_id, user_id, type, created_at)
   - Tipos: energia, apoio, lua, estrela
   - Constraint UNIQUE para evitar duplicatas

2. Crie API app/api/community/posts/[id]/reactions/route.ts:
   - POST: adicionar reação (toggle - remove se já existe)
   - GET: retorna contagem por tipo + se usuário reagiu

3. Modifique GET /api/community/posts para incluir:
   - Contagem de cada tipo de reação
   - Array de tipos que o usuário logado reagiu

4. Atualize PostCard.tsx:
   - Mostrar estado "ativo" se usuário reagiu
   - Animação de partículas ao reagir
   - Atualização otimística

5. Adicione 2 novos tipos de reação com ícones:
   - 🌙 lua (para conteúdo lunar)
   - ⭐ estrela (favorito especial)
```

### Prompt 4: Notificações (Fase 4)
```
Implemente sistema de notificações:

1. Crie migration infra/db/11-community-notifications.sql:
   - Tabela com tipos: follow, reaction, comment, mention
   - Índices para queries eficientes

2. Crie APIs:
   - GET /api/community/notifications (lista paginada)
   - POST /api/community/notifications/read (marcar como lida)
   - GET /api/community/notifications/count (não lidas)

3. Modifique APIs existentes para criar notificações:
   - Ao seguir: notifica o seguido
   - Ao reagir: notifica autor do post
   - Ao comentar: notifica autor do post

4. Crie NotificationBell.tsx:
   - Ícone com badge de contagem
   - Dropdown com lista de notificações
   - Link para ação relacionada
   - Marcar como lida ao visualizar

5. Integre no CommunityHeader existente
```

---

## 📁 Estrutura de Arquivos Final

```
app/comunidade/
├── page.tsx                          # Feed principal
├── components/
│   ├── index.ts
│   ├── PostCard.tsx                  # ✏️ Modificar (reações)
│   ├── CommunityHeader.tsx           # ✏️ Modificar (notificações)
│   ├── FeedTabs.tsx                  # 🆕 Tabs Para você/Seguindo
│   ├── NotificationBell.tsx          # 🆕 Notificações
│   ├── NotificationDropdown.tsx      # 🆕 Lista de notificações
│   └── profile/
│       ├── index.ts                  # 🆕
│       ├── ProfileHeader.tsx         # 🆕
│       ├── ProfileStats.tsx          # 🆕
│       ├── FollowButton.tsx          # 🆕
│       ├── CosmicLevelBadge.tsx      # 🆕
│       └── ProfilePostGrid.tsx       # 🆕
└── perfil/
    └── [userId]/
        └── page.tsx                  # 🆕 Perfil público

app/api/community/
├── posts/
│   ├── route.ts                      # ✏️ Modificar (feed seguindo)
│   └── [id]/
│       ├── route.ts
│       ├── comments/route.ts
│       └── reactions/route.ts        # 🆕
├── profile/
│   ├── route.ts                      # Perfil próprio (existente)
│   └── [userId]/route.ts             # 🆕 Perfil público
├── follows/
│   ├── route.ts                      # 🆕 Seguir/deixar de seguir
│   └── [userId]/route.ts             # 🆕 Lista seguidores/seguindo
└── notifications/
    ├── route.ts                      # 🆕 Lista notificações
    ├── count/route.ts                # 🆕 Contagem não lidas
    └── read/route.ts                 # 🆕 Marcar como lida

infra/db/
├── 06-community.sql                  # Existente
├── 08-user-profile-extended.sql      # 🆕 Campos extras do perfil
├── 09-community-follows.sql          # 🆕 Tabela follows
├── 10-community-reactions.sql        # 🆕 Tabela reactions
└── 11-community-notifications.sql    # 🆕 Tabela notifications
```

---

## ⏱️ Estimativas de Tempo

| Fase | Descrição | Tempo |
|------|-----------|-------|
| 1 | Perfil Público Expandido | 4-6h |
| 2 | Sistema de Follows | 3-4h |
| 3 | Reações Persistentes | 2-3h |
| 4 | Notificações | 4-5h |
| 5 | Gamificação | 3-4h |
| **Total** | | **16-22h** |

---

## 🎨 Referência Visual

### Cores do Tema
```css
--bg-primary: slate-950
--bg-card: slate-900/60 + glassmorphism
--border: slate-800/70
--accent: indigo-400/500
--text-primary: white
--text-secondary: slate-300
--text-muted: slate-500
```

### Níveis Cósmicos
```css
--lua-nova: slate-400 (neutro)
--quarto-crescente: amber-400 (crescendo)
--lua-cheia: indigo-400 (brilhante)
--estrela-guia: gradient amber→rose (especial)
```

---

## ✅ Checklist de Implementação

### Fase 1: Perfil Público
- [ ] Migration SQL campos extras
- [ ] API GET /profile/[userId]
- [ ] Página /comunidade/perfil/[userId]
- [ ] Componente ProfileHeader
- [ ] Componente ProfileStats
- [ ] Componente CosmicLevelBadge
- [ ] Componente ProfilePostGrid
- [ ] Link no avatar do PostCard
- [ ] Testes básicos

### Fase 2: Follows
- [ ] Migration SQL tabela follows
- [ ] API POST/DELETE /follows
- [ ] API GET /follows/[userId]
- [ ] Componente FollowButton
- [ ] Modificar feed para ?feed=following
- [ ] Componente FeedTabs
- [ ] Página de seguidores/seguindo
- [ ] Testes

### Fase 3: Reações
- [ ] Migration SQL tabela reactions
- [ ] API /posts/[id]/reactions
- [ ] Modificar GET /posts para incluir reações
- [ ] Atualizar PostCard com estados
- [ ] Animações de feedback
- [ ] Testes

### Fase 4: Notificações
- [ ] Migration SQL tabela notifications
- [ ] API CRUD notificações
- [ ] Triggers para criar notificações
- [ ] Componente NotificationBell
- [ ] Componente NotificationDropdown
- [ ] Integrar no header
- [ ] Testes

### Fase 5: Gamificação
- [ ] Definir sistema de pontos
- [ ] Trigger para calcular nível
- [ ] Badges especiais
- [ ] UI de progresso
- [ ] Testes

---

*Documento criado em 11 de janeiro de 2026*
*Última atualização: 11/01/2026*
