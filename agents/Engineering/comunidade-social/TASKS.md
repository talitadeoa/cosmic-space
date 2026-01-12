# 🌙 Comunidade Social - Tasks de Implementação

> Tasks organizadas por prioridade para transformar `/comunidade` em uma rede social completa.

---

## 📊 Dashboard de Progresso

| Fase | Status | Progresso |
|------|--------|-----------|
| 1. Perfil Público | 🔲 Não iniciado | 0/8 |
| 2. Sistema de Follows | 🔲 Não iniciado | 0/7 |
| 3. Reações Persistentes | 🔲 Não iniciado | 0/6 |
| 4. Feed Personalizado | 🔲 Não iniciado | 0/5 |
| 5. Notificações | 🔲 Não iniciado | 0/6 |

**Legenda:** 🔲 Não iniciado | 🔄 Em progresso | ✅ Concluído | ⏸️ Bloqueado

---

## 🎯 FASE 1: Perfil Público Expandido

### Task 1.1: Migration - Campos Extras do Perfil
- **Arquivo:** `infra/db/08-user-profile-extended.sql`
- **Prompt:** `prompts/01-profile-migration.md`
- **Status:** 🔲
- **Dependências:** Nenhuma

### Task 1.2: API - Perfil Público por ID
- **Arquivo:** `app/api/community/profile/[userId]/route.ts`
- **Prompt:** `prompts/02-profile-api.md`
- **Status:** 🔲
- **Dependências:** Task 1.1

### Task 1.3: Componentes de Perfil
- **Arquivos:** `app/comunidade/components/profile/*`
- **Prompt:** `prompts/03-profile-components.md`
- **Status:** 🔲
- **Dependências:** Nenhuma (pode fazer em paralelo)

### Task 1.4: Página de Perfil Público
- **Arquivo:** `app/comunidade/perfil/[userId]/page.tsx`
- **Prompt:** `prompts/04-profile-page.md`
- **Status:** 🔲
- **Dependências:** Tasks 1.2, 1.3

### Task 1.5: Link para Perfil nos Posts
- **Arquivo:** `app/comunidade/components/PostCard.tsx`
- **Prompt:** `prompts/05-profile-link.md`
- **Status:** 🔲
- **Dependências:** Task 1.4

### Task 1.6: Componente CosmicLevelBadge
- **Arquivo:** `app/comunidade/components/profile/CosmicLevelBadge.tsx`
- **Prompt:** Incluído em `prompts/03-profile-components.md`
- **Status:** 🔲
- **Dependências:** Nenhuma

### Task 1.7: Testes da Fase 1
- **Arquivos:** Testes manuais
- **Status:** 🔲
- **Dependências:** Todas anteriores

### Task 1.8: Review e Merge
- **Status:** 🔲
- **Dependências:** Task 1.7

---

## 🔗 FASE 2: Sistema de Follows

### Task 2.1: Migration - Tabela Follows
- **Arquivo:** `infra/db/09-community-follows.sql`
- **Prompt:** `prompts/06-follows-migration.md`
- **Status:** 🔲
- **Dependências:** Fase 1 completa

### Task 2.2: API - Seguir/Deixar de Seguir
- **Arquivo:** `app/api/community/follows/route.ts`
- **Prompt:** `prompts/07-follows-api.md`
- **Status:** 🔲
- **Dependências:** Task 2.1

### Task 2.3: API - Lista de Seguidores/Seguindo
- **Arquivo:** `app/api/community/follows/[userId]/route.ts`
- **Prompt:** `prompts/08-follows-list-api.md`
- **Status:** 🔲
- **Dependências:** Task 2.1

### Task 2.4: Componente FollowButton
- **Arquivo:** `app/comunidade/components/profile/FollowButton.tsx`
- **Prompt:** `prompts/09-follow-button.md`
- **Status:** 🔲
- **Dependências:** Task 2.2

### Task 2.5: Página de Seguidores/Seguindo
- **Arquivo:** `app/comunidade/perfil/[userId]/follows/page.tsx`
- **Prompt:** `prompts/10-follows-page.md`
- **Status:** 🔲
- **Dependências:** Tasks 2.3, 2.4

### Task 2.6: Testes da Fase 2
- **Status:** 🔲
- **Dependências:** Todas anteriores

### Task 2.7: Review e Merge
- **Status:** 🔲
- **Dependências:** Task 2.6

---

## ❤️ FASE 3: Reações Persistentes

### Task 3.1: Migration - Tabela Reactions
- **Arquivo:** `infra/db/10-community-reactions.sql`
- **Prompt:** `prompts/11-reactions-migration.md`
- **Status:** 🔲
- **Dependências:** Nenhuma (pode começar em paralelo)

### Task 3.2: API - Adicionar/Remover Reação
- **Arquivo:** `app/api/community/posts/[id]/reactions/route.ts`
- **Prompt:** `prompts/12-reactions-api.md`
- **Status:** 🔲
- **Dependências:** Task 3.1

### Task 3.3: Modificar GET Posts - Incluir Reações
- **Arquivo:** `app/api/community/posts/route.ts`
- **Prompt:** `prompts/13-posts-with-reactions.md`
- **Status:** 🔲
- **Dependências:** Task 3.1

### Task 3.4: Atualizar PostCard - Estados de Reação
- **Arquivo:** `app/comunidade/components/PostCard.tsx`
- **Prompt:** `prompts/14-postcard-reactions.md`
- **Status:** 🔲
- **Dependências:** Tasks 3.2, 3.3

### Task 3.5: Testes da Fase 3
- **Status:** 🔲
- **Dependências:** Todas anteriores

### Task 3.6: Review e Merge
- **Status:** 🔲
- **Dependências:** Task 3.5

---

## 📰 FASE 4: Feed Personalizado

### Task 4.1: Modificar API Posts - Feed Seguindo
- **Arquivo:** `app/api/community/posts/route.ts`
- **Prompt:** `prompts/15-feed-following.md`
- **Status:** 🔲
- **Dependências:** Fase 2 completa

### Task 4.2: Componente FeedTabs
- **Arquivo:** `app/comunidade/components/FeedTabs.tsx`
- **Prompt:** `prompts/16-feed-tabs.md`
- **Status:** 🔲
- **Dependências:** Nenhuma

### Task 4.3: Integrar Tabs no Feed Principal
- **Arquivo:** `app/comunidade/page.tsx`
- **Prompt:** `prompts/17-integrate-feed-tabs.md`
- **Status:** 🔲
- **Dependências:** Tasks 4.1, 4.2

### Task 4.4: Testes da Fase 4
- **Status:** 🔲
- **Dependências:** Todas anteriores

### Task 4.5: Review e Merge
- **Status:** 🔲
- **Dependências:** Task 4.4

---

## 🔔 FASE 5: Notificações

### Task 5.1: Migration - Tabela Notifications
- **Arquivo:** `infra/db/11-community-notifications.sql`
- **Prompt:** `prompts/18-notifications-migration.md`
- **Status:** 🔲
- **Dependências:** Nenhuma

### Task 5.2: API - CRUD Notificações
- **Arquivo:** `app/api/community/notifications/route.ts`
- **Prompt:** `prompts/19-notifications-api.md`
- **Status:** 🔲
- **Dependências:** Task 5.1

### Task 5.3: Triggers - Criar Notificações Automáticas
- **Arquivo:** Modificar APIs de follows, reactions, comments
- **Prompt:** `prompts/20-notification-triggers.md`
- **Status:** 🔲
- **Dependências:** Task 5.2

### Task 5.4: Componentes de Notificação
- **Arquivos:** `NotificationBell.tsx`, `NotificationDropdown.tsx`
- **Prompt:** `prompts/21-notification-components.md`
- **Status:** 🔲
- **Dependências:** Task 5.2

### Task 5.5: Testes da Fase 5
- **Status:** 🔲
- **Dependências:** Todas anteriores

### Task 5.6: Review e Merge
- **Status:** 🔲
- **Dependências:** Task 5.5

---

## 🗓️ Cronograma Sugerido

```
Semana 1: Fase 1 (Perfil Público)
├── Dia 1-2: Tasks 1.1, 1.2, 1.3
├── Dia 3-4: Tasks 1.4, 1.5, 1.6
└── Dia 5: Tasks 1.7, 1.8

Semana 2: Fase 2 + Fase 3 (em paralelo)
├── Dia 1-2: Tasks 2.1-2.4 + 3.1
├── Dia 3-4: Tasks 2.5-2.7 + 3.2-3.4
└── Dia 5: Tasks 3.5, 3.6

Semana 3: Fase 4 + Fase 5
├── Dia 1-2: Fase 4 completa
├── Dia 3-4: Tasks 5.1-5.4
└── Dia 5: Tasks 5.5, 5.6
```

---

## 🧠 FEATURE EXTRA: Modo Brainstorm no ChatModal

### ✅ Implementado em 11/01/2026

**Descrição:** Botão de brainstorm no ChatModal de planeta que ativa um modo de conversa inteligente para coletar, organizar e resumir ideias.

### Componentes Criados:

| Arquivo | Descrição |
|---------|-----------|
| `hooks/useBrainstormSession.ts` | Hook para gerenciar sessão de brainstorm (estado, ideias, clusters) |
| `components/brainstorm/BrainstormPanel.tsx` | Painel lateral para visualizar e organizar ideias |
| `components/brainstorm/index.ts` | Export barrel |

### Modificações:

| Arquivo | Mudança |
|---------|---------|
| `app/cosmos/components/CosmosChatModal.tsx` | Integração do modo brainstorm com botão no header |

### Como Usar:

```tsx
<CosmosChatModal
  isOpen={isOpen}
  storageKey="meu-chat"
  title="Chat com Brainstorm"
  placeholder="Digite sua mensagem..."
  enableBrainstorm={true}  // ← Habilita o botão de brainstorm
  onClose={() => setIsOpen(false)}
  onSubmit={handleSubmit}
/>
```

### Funcionalidades:
- **Ativação:** Botão 💡 no header do chat
- **Coleta de ideias:** Todas as mensagens são salvas como ideias
- **Prompts inteligentes:** Perguntas de follow-up para expandir conceitos
- **Painel lateral:** Visualização em tempo real das ideias
- **Marcar ideias-chave:** Destaque para ideias principais (⭐)
- **Agrupamento:** Criar clusters de ideias relacionadas
- **Resumo automático:** Gerar síntese estruturada ao final

### Estados do Brainstorm:
1. `idle` → Chat normal
2. `brainstorming` → Coletando ideias
3. `organizing` → Reorganizando ideias em clusters
4. `summarizing` → Gerando resumo final

---

## 📝 Notas de Implementação

### Padrões a Seguir
- Mobile-first design
- Cores: slate/indigo theme existente
- Componentes com `memo` para performance
- APIs com validação de auth via `getTokenPayload`
- Mensagens de erro amigáveis em português

### Referências
- Design atual: `app/comunidade/components/PostCard.tsx`
- API existente: `app/api/community/posts/route.ts`
- Schema atual: `infra/db/06-community.sql`

---

*Atualizado em: 11 de janeiro de 2026*
