# 🔄 Dev vs Prod: Diferenças na Sincronização

## 🎯 Resumo rápido

| Aspecto | Dev | Prod |
|--------|-----|------|
| **Database** | Neon Branch `develop` | Neon Branch `main` |
| **Cookie Secure** | ❌ false (http) | ✅ true (https) |
| **Cookie SameSite** | lax | lax |
| **Domínio** | localhost:3000 | https://flua.vercel.app |
| **Credenciais** | credentials: 'include' | credentials: 'include' |
| **Polling** | ✅ Funciona igual | ✅ Funciona igual |

---

## 🗄️ Banco de Dados & Neon Branches

### Development

```env
# .env.local (seu arquivo local)
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxxxx.neon.tech/neondb?sslmode=require
```

**Usa:** Branch `develop` do Neon
- Dados isolados do production
- Ideal para testes
- Sem lock com production

### Production

```env
# .env.production
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxxxx-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dmain
```

**Usa:** Branch `main` do Neon com **pooler endpoint**
- `pooler.sa-east-1.aws.neon.tech` = Pooler (melhor performance)
- `&options=endpoint%3Dmain` = Aponta para branch `main`
- Dados reais dos usuários

---

## 🔒 Cookies & Autenticação

### Configuração atual (app/api/auth/login/route.ts):

```typescript
response.cookies.set('auth_token', token, {
  httpOnly: true,                           // ✅ Não acessível via JS
  secure: process.env.NODE_ENV === 'production',  // ⚠️ DIFERENÇA!
  sameSite: 'lax',                          // ✅ Permite cross-site no mesmo host
  maxAge: 24 * 60 * 60,                    // ✅ 24 horas
});
```

### Development

```
secure: false  // Cookie é enviado via HTTP
```

**Impacto na sincronização:**
- ✅ Funciona normal em localhost:3000
- ❌ Não funcionaria em HTTPS com `secure: false`
- ✅ `credentials: 'include'` envia o cookie normalmente

### Production

```
secure: true   // Cookie só é enviado via HTTPS
```

**Impacto na sincronização:**
- ✅ Funciona em HTTPS (https://flua.vercel.app)
- ❌ Falharia em HTTP (inseguro, browser bloqueia)
- ✅ `credentials: 'include'` envia o cookie normalmente

---

## 🌐 CORS & Fetch Credentials

### Current setup:

Ambos dev e prod usam:

```typescript
fetch('/api/planet-state', { credentials: 'include' })
```

**Por que funciona:**
- URL relativa (`/api/...`) = mesmo domínio
- CORS não é bloqueado (requisição same-origin)
- Cookie é enviado automaticamente

### ⚠️ Se mudar para domínio diferente:

```typescript
fetch('https://api.outro-dominio.com/sync', { credentials: 'include' })
```

Você precisaria:

1. **Backend:** Permitir CORS com credentials
```typescript
// Próximo.js middleware ou API route
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Origin', 'https://seu-dominio.com');
```

2. **Frontend:** Manter `credentials: 'include'`

---

## 📊 Fluxo de Sincronização (Dev vs Prod)

### Development

```
┌─────────────────────────────────────────────────────────┐
│ localhost:3000/cosmos/planeta                           │
├─────────────────────────────────────────────────────────┤
│ 1. POST /api/auth/login                                │
│    → cookie auth_token (secure: false)                 │
│                                                         │
│ 2. GET /api/planet-state                               │
│    + credentials: 'include'                            │
│    + cookie auth_token via HTTP ✅                     │
│    = Response 200                                       │
│                                                         │
│ 3. setInterval (10s)                                   │
│    → GET /api/planet-state (repetido)                  │
│    → Sincronização funciona normalmente                │
└─────────────────────────────────────────────────────────┘
```

### Production

```
┌──────────────────────────────────────────────────────────┐
│ https://flua.vercel.app/cosmos/planeta                  │
├──────────────────────────────────────────────────────────┤
│ 1. POST /api/auth/login                                │
│    → cookie auth_token (secure: true)                  │
│                                                         │
│ 2. GET /api/planet-state                               │
│    + credentials: 'include'                            │
│    + cookie auth_token via HTTPS ✅                    │
│    = Response 200                                       │
│                                                         │
│ 3. setInterval (10s)                                   │
│    → GET /api/planet-state (repetido)                  │
│    → Sincronização funciona normalmente                │
└──────────────────────────────────────────────────────────┘
```

---

## 🚨 Possíveis problemas de sincronização

### Em Development

| Problema | Causa | Solução |
|----------|-------|---------|
| Cookie não persiste | Local storage desativado | Ativar cookies no navegador |
| 401 ao sincronizar | Token expirado | Fazer logout/login |
| Requisições 404 | URL errada | Verificar `/api/planet-state` existe |

### Em Production

| Problema | Causa | Solução |
|----------|-------|---------|
| Cookie rejeitado | `secure: false` em HTTPS | Já está `true` - checar NODE_ENV |
| Mixed content error | HTTP em página HTTPS | Usar apenas HTTPS |
| CORS bloqueado | Domínio diferente | Configurar CORS no backend |
| Token rejeitado | Token criado em dev | Fazer login novamente em prod |

---

## 🔑 Variáveis críticas por ambiente

### Development (.env.local)

```env
# Banco de dados
DATABASE_URL=postgresql://...@ep-xxxxx.neon.tech/...?sslmode=require
# ↑ Branch 'develop' (sem pooler)

# Base URL (opcional, para OAuth)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Auth
AUTH_PASSWORD=seu_senha_dev
AUTH_TOKEN_TTL_SECONDS=86400
```

### Production (.env.production)

```env
# Banco de dados
DATABASE_URL=postgresql://...@ep-xxxxx-pooler.sa-east-1.aws.neon.tech/...?sslmode=require&options=endpoint%3Dmain
# ↑ Branch 'main' + pooler endpoint (melhor performance)

# Base URL (para OAuth e redirects)
NEXT_PUBLIC_BASE_URL=https://flua.vercel.app

# Auth
AUTH_PASSWORD=sua_senha_prod
AUTH_TOKEN_TTL_SECONDS=86400
```

---

## 📈 Performance: Pooler vs Direto

### Development (sem pooler)

```
Requisição → Neon Endpoint → Database Connection
                ↑ Cria nova conexão cada vez
                ❌ Mais lento em production
```

### Production (com pooler)

```
Requisição → Pooler Endpoint → Connection Pool → Database
                ↑ Reutiliza conexões existentes
                ✅ Muito mais rápido
```

**No seu .env.production, note:**
```
-pooler.sa-east-1.aws.neon.tech  ← Pooler
&options=endpoint%3Dmain          ← Branch main
```

---

## 🧪 Como testar sincronização em ambos

### Development

```bash
npm run dev
# localhost:3000
# DevTools Network: veja requisições HTTP (sem 🔒)
```

### Production (local, simulando prod)

```bash
# Build como production
npm run build

# Servir como production (com HTTPS simulado)
npm run start

# DevTools Network: vê requisições HTTPS
```

---

## ⚠️ Checklist: Sincronização pronta para Prod

- [ ] `DATABASE_URL` em `.env.production` aponta para **pooler endpoint**
- [ ] `DATABASE_URL` tem `&options=endpoint%3Dmain` (branch main)
- [ ] `secure: process.env.NODE_ENV === 'production'` em cookies ✅ (já está)
- [ ] `NEXT_PUBLIC_BASE_URL` configurado para produção
- [ ] `credentials: 'include'` em todos os fetches de sincronização ✅ (já está)
- [ ] Testou sincronização em 2 abas antes de deploy
- [ ] Logs mostram `GET /api/planet-state` a cada 10s
- [ ] Database branch `main` tem dados iniciais (usuários, etc)

---

## 🔄 Branch Strategy

### Recomendado

```
Local Development
  ↓ use: DATABASE_URL (branch 'develop')
  ↓ test synchronization
  ↓
GitHub Push
  ↓ Vercel auto-deploys
  ↓
Production
  ↓ use: DATABASE_URL (branch 'main' + pooler)
  ↓ real users
```

### Isolamento de dados

**Nunca compartilhe dados entre branches:**
- Dev usa `develop` (teste isolado)
- Prod usa `main` (dados reais)
- Neon permite branch por ambiente

---

## 📞 Debugging

### Verificar qual branch está sendo usado

```sql
-- Qualquer query no banco vai rodar na branch configurada
SELECT version();

-- Em Development (branch develop)
-- Resultado diferente de Production (branch main)
```

### Verificar cookies no DevTools

**Dev (localhost):**
```
F12 → Application → Cookies → localhost:3000
auth_token: xxxxx
Secure: ❌ (false)
SameSite: Lax ✅
```

**Prod (flua.vercel.app):**
```
F12 → Application → Cookies → flua.vercel.app
auth_token: xxxxx
Secure: ✅ (true, no cadeado)
SameSite: Lax ✅
```

### Verificar requisições de sincronização

**Ambos dev e prod:**
```
F12 → Network
Filter: planet-state

GET /api/planet-state → 200 OK
(repete a cada 10 segundos)
```

Se não aparecer: Sincronização não está funcionando naquele ambiente.

---

## 🚀 Próximas melhorias

1. Adicionar logging de sincronização (qual branch, quantas requisições, etc)
2. Indicador visual mostrando "Sincronizado com [branch]"
3. Health check para verificar se Database está acessível
4. Fallback automático se branch principal cair

Bom luck! 🚀
