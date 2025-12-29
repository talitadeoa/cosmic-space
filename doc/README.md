# 📚 Documentação Cosmic Space

> Documentação consolidada e organizada do projeto Flua - Sistema lunar/astral integrado

**🎉 DOCUMENTAÇÃO REORGANIZADA!** A documentação foi completamente reestruturada para facilitar a navegação. Documentação antiga está em [archive/](archive/).

---

## 🚀 Início Rápido

### Para Desenvolvedores
1. **[Getting Started](guides/getting-started.md)** - Setup inicial e instalação (10 min)
2. **[Autenticação](guides/authentication.md)** - Neon Auth setup (15 min)
3. **[Componentes](guides/components.md)** - Guia de componentes (20 min)

### Para Arquitetos
- **[Visão Geral](architecture/overview.md)** - Arquitetura técnica completa

---

## 📖 Guias Disponíveis

| Guia | Descrição | Tempo |
|------|-----------|-------|
| **[Getting Started](guides/getting-started.md)** | Setup do projeto e primeiros passos | 10 min |
| **[Autenticação](guides/authentication.md)** | Setup Neon Auth e proteção de rotas | 15 min |
| **[Componentes](guides/components.md)** | Componentes globais e layouts | 20 min |

### Em Breve
- [ ] Calendário Lunar - Sistema de calendário e lunações
- [ ] Insights - Sistema de insights mensais/trimestrais
- [ ] Responsividade - Guia de responsividade mobile
- [ ] Database - Schema e queries

---

## 🏗️ Arquitetura Rápida

```
cosmic-space/
├── app/              # Next.js App Router
│   ├── (root)/      # Rotas protegidas (AuthGate)
│   └── api/         # API routes
├── components/       # Componentes reutilizáveis
│   ├── auth/        # AuthGate, proteção
│   ├── layouts/     # SpacePageLayout
│   ├── providers/   # Contextos globais
│   └── sync/        # AutoSync, LunationSync
├── lib/             # Utilitários e helpers
└── infra/db/        # Schemas Drizzle ORM
```

**Arquitetura completa**: [architecture/overview.md](architecture/overview.md)

---

## 🔑 Conceitos Principais

### Autenticação (Neon Auth)
Sistema gerenciado baseado em Better Auth com OAuth Google/GitHub e proteção automática de rotas via `AuthGate`.

### Componentes Globais
```tsx
// Layout padrão com menu e player
<SpacePageLayout>
  <YourContent />
</SpacePageLayout>

// Proteção de rota
<AuthGate>
  <ProtectedRoute />
</AuthGate>
```

### Sistema Lunar
- **AutoSyncLunar**: Sincronização automática de lunações
- **LunationSync**: Sincronização manual via Google Calendar
- **GalaxySunsSync**: Eventos especiais (eclipses)

---

## 📚 Referência Rápida

| Componente | Localização | Uso |
|-----------|-------------|-----|
| `AuthGate` | `components/auth` | Proteção de rotas |
| `SpacePageLayout` | `components/layouts` | Layout padrão |
| `RadioPlayer` | `components/audio` | Player de rádio |
| `AutoSyncLunar` | `components/sync` | Auto-sync lunações |
| `NavMenu` | `components/navigation` | Menu principal |

---

## 🔧 Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run db:push      # Atualizar schema
npm run db:studio    # Drizzle Studio
```

---

## 🗂️ Estrutura da Documentação

```
doc/
├── README.md              # Índice principal (você está aqui)
├── guides/                # Guias passo a passo
│   ├── getting-started.md
│   ├── authentication.md
│   └── components.md
├── architecture/          # Arquitetura técnica
│   └── overview.md
├── reference/             # Referências de API
└── archive/               # Documentação legada
```

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| **Erro de auth** | Veja [guides/authentication.md](guides/authentication.md#troubleshooting) |
| **Database error** | Verifique `DATABASE_URL` no `.env.local` |
| **Lunações não aparecem** | Execute sync manual ou aguarde `AutoSyncLunar` |
| **Build falha** | Limpe cache: `rm -rf .next && npm run build` |

---

## 📦 Migração da Documentação

A documentação foi **reorganizada em Dezembro/2024**:

- ✅ **Antes**: 108 arquivos fragmentados
- ✅ **Agora**: ~10 guias consolidados
- ✅ **Resultado**: Navegação clara e sem duplicação

Documentação antiga preservada em [archive/](archive/).

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Commits semânticos: `feat:`, `fix:`, `docs:`
3. Abra um Pull Request
4. Aguarde code review

---

**Última atualização**: Dezembro 2024

**📌 Comece por**: [guides/getting-started.md](guides/getting-started.md)
