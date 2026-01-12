# 🚀 Quick Start - Comunidade Social

> Guia rápido para implementar as features de rede social.

---

## 📁 Estrutura de Arquivos

```
agents/Engineering/comunidade-social/
├── TASKS.md                    # Dashboard de progresso
├── QUICKSTART.md               # Este arquivo
└── prompts/
    ├── 01-profile-migration.md     # Fase 1
    ├── 02-profile-api.md           # Fase 1
    ├── 03-profile-components.md    # Fase 1
    ├── 04-profile-page.md          # Fase 1
    ├── 05-profile-link.md          # Fase 1
    ├── 06-follows-migration.md     # Fase 2
    ├── 07-follows-api.md           # Fase 2
    ├── 09-follow-button.md         # Fase 2
    ├── 11-reactions-migration.md   # Fase 3
    ├── 12-reactions-api.md         # Fase 3
    ├── 16-feed-tabs.md             # Fase 4
    └── 18-notifications-migration.md # Fase 5
```

---

## ⚡ Como Usar

### 1. Escolha uma Task
Abra `TASKS.md` e escolha a próxima task não iniciada.

### 2. Abra o Prompt
Navegue até `prompts/XX-nome.md` correspondente.

### 3. Copie e Execute
Copie o conteúdo do prompt e cole no chat do Copilot para implementar.

### 4. Marque como Concluído
Atualize o status em `TASKS.md`.

---

## 🎯 Ordem Recomendada

### Semana 1: Perfil Público
```
01-profile-migration.md  →  Executar SQL
02-profile-api.md        →  Criar API
03-profile-components.md →  Criar componentes
04-profile-page.md       →  Criar página
05-profile-link.md       →  Conectar ao PostCard
```

### Semana 2: Follows + Reações
```
06-follows-migration.md  →  Executar SQL
07-follows-api.md        →  Criar API
09-follow-button.md      →  Criar componente

11-reactions-migration.md →  Executar SQL (paralelo)
12-reactions-api.md       →  Criar API
```

### Semana 3: Feed + Notificações
```
16-feed-tabs.md              →  Criar componente
18-notifications-migration.md →  Executar SQL
```

---

## 🔧 Comandos Úteis

### Executar Migration
```bash
# Via psql
psql $DATABASE_URL -f infra/db/08-user-profile-extended.sql

# Ou via script
npm run db:migrate
```

### Testar API
```bash
# GET perfil público
curl http://localhost:3000/api/community/profile/1

# POST seguir
curl -X POST http://localhost:3000/api/community/follows \
  -H "Content-Type: application/json" \
  -d '{"userId": "2"}'

# POST reação
curl -X POST http://localhost:3000/api/community/posts/1/reactions \
  -H "Content-Type: application/json" \
  -d '{"type": "energia"}'
```

---

## 📋 Checklist Rápido

### Fase 1: Perfil Público
- [ ] Migration executada
- [ ] API `/profile/[userId]` criada
- [ ] Componentes ProfileHeader, ProfileStats, CosmicLevelBadge criados
- [ ] Página `/comunidade/perfil/[userId]` criada
- [ ] PostCard com link para perfil

### Fase 2: Follows
- [ ] Migration executada
- [ ] API `/follows` criada
- [ ] FollowButton criado
- [ ] Integrado na página de perfil

### Fase 3: Reações
- [ ] Migration executada
- [ ] API `/posts/[id]/reactions` criada
- [ ] PostCard atualizado com reações persistentes

### Fase 4: Feed
- [ ] FeedTabs criado
- [ ] API suporta `?feed=following`
- [ ] Tabs integradas na página

### Fase 5: Notificações
- [ ] Migration executada
- [ ] API `/notifications` criada
- [ ] NotificationBell criado

---

## 🎨 Design System

### Cores
```css
--bg: slate-950
--card: slate-900/60
--border: slate-800/70
--accent: indigo-400
--success: emerald-400
--warning: amber-400
--error: rose-400
```

### Níveis Cósmicos
| Nível | Emoji | Cor | Pontos |
|-------|-------|-----|--------|
| Lua Nova | 🌑 | slate | 0-99 |
| Quarto Crescente | 🌓 | amber | 100-499 |
| Lua Cheia | 🌕 | indigo | 500-1999 |
| Estrela Guia | ⭐ | amber→rose | 2000+ |

### Pontos Cósmicos
| Ação | Pontos |
|------|--------|
| Criar post | +10 |
| Receber follow | +5 |
| Receber reação estrela | +5 |
| Receber reação lua | +3 |
| Receber reação energia/apoio | +2 |
| Comentar | +5 |
| Receber comentário | +3 |

---

## 🐛 Troubleshooting

### Erro: "Tabela não existe"
→ Execute a migration correspondente

### Erro: "Trigger já existe"
→ O script usa `DROP TRIGGER IF EXISTS`, deve funcionar

### Erro: "Coluna não existe"
→ Verifique se migration anterior foi executada

### API retorna 401
→ Verifique se está logado e token está válido

---

*Última atualização: 11 de janeiro de 2026*
