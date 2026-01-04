# 🔧 Troubleshooting: Sincronização de Planeta

## 🚀 Quick Start - Teste Rápido

Antes de fazer troubleshooting, teste se está funcionando:

```bash
# 1. Terminal 1: Rodar dev server
npm run dev
# Aguarde: "▲ Next.js ... ready on http://localhost:3000"

# 2. Terminal 2: Abrir em 2 abas
open http://localhost:3000/cosmos/planeta  # Aba A
open http://localhost:3000/cosmos/planeta  # Aba B
```

---

## 📋 Checklist: O que verificar

### ✅ **Nível 1: Autenticação**

- [ ] Consigo fazer login em ambas abas?
- [ ] Depois do login, sou direcionado corretamente?
- [ ] O cookie `auth_token` aparece no DevTools?

**Se falhar aqui:** Vá para [❌ Problema 1](#problema-1-autenticacao-falhando)

---

### ✅ **Nível 2: Requisições de Sincronização**

- [ ] F12 → Network tab
- [ ] Filtre por "planet-state" e "planet-todos"
- [ ] Aparecem requisições GET a cada ~10 segundos?
- [ ] O status é 200 (sucesso)?

**Se não aparecer:** Vá para [❌ Problema 2](#problema-2-nao-ha-requisicoes-de-sync)
**Se status é 401:** Vá para [❌ Problema 3](#problema-3-erro-401-nao-autenticado)

---

### ✅ **Nível 3: Dados Sincronizando**

- [ ] Modifique algo na Aba A (nome planeta, cor, etc)
- [ ] Aguarde até 10 segundos
- [ ] A mudança aparece na Aba B automaticamente?

**Se não sincroniza:** Vá para [❌ Problema 4](#problema-4-dados-nao-sincronizam)

---

## ❌ Problema 1: Autenticação falhando

### Sintomas:
```
❌ Não consigo fazer login
❌ Erro "Email ou senha inválidos"
❌ Após login, continua em tela de login
```

### Checklist de diagnóstico:

```bash
# 1. Verificar se DB está acessível
npm run build
# Se falha aqui: DB não está conectando

# 2. Verificar .env.local
cat .env.local | grep DATABASE_URL
# Deve ter um DATABASE_URL válido

# 3. Verificar console do browser
F12 → Console
# Procure por erros de fetch/autenticação
```

### Soluções:

**A. DATABASE_URL inválida:**

```env
# ❌ Errado
DATABASE_URL=postgresql://user@host/db

# ✅ Certo
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxxxx.neon.tech/neondb?sslmode=require
```

**B. Variáveis de auth faltando:**

```env
# Adicione a .env.local
AUTH_PASSWORD=cosmos2025
AUTH_TOKEN_TTL_SECONDS=86400
```

**C. Reset completo:**

```bash
# 1. Limpar cache
rm -rf .next
rm node_modules/.cache

# 2. Reinstalar
npm install

# 3. Rodar novamente
npm run dev
```

---

## ❌ Problema 2: Não há requisições de sync

### Sintomas:
```
❌ Network tab vazio (sem /api/planet-state)
❌ Console mostra erros de fetch
❌ Sincronização não acontece
```

### Checklist:

```bash
# 1. Console do browser
F12 → Console
# Procure por "Falha ao sincronizar" ou erros de fetch

# 2. Verificar se hook está montando
# Procure por logs de:
# - "hasLoaded changed to true"
# - "isAuthenticated changed to true"

# 3. Verificar Network filter
F12 → Network
# Certifique-se de que não está filtrado
# Deselecione JS, CSS, etc - deixe "All"
```

### Soluções:

**A. Polling não iniciou (auth falhou):**

```typescript
// Em usePlanetState.ts linha ~85
useEffect(() => {
  console.log('Polling check:', { hasLoaded, isAuthenticated });
  // Se mostrar "false, false" = auth não completou ainda
}, [hasLoaded, isAuthenticated]);
```

**B. Auth ainda está carregando:**

```bash
# No Console:
const { loading, isAuthenticated } = useAuth()
console.log({ loading, isAuthenticated })

# Se loading = true, aguarde mais
```

**C. useAuth não está disponível:**

```bash
# Verificar se está dentro de AuthProvider:
# app/layout.tsx deve ter <AuthProvider> envolvendo tudo
cat app/layout.tsx | grep -A5 "AuthProvider"
```

---

## ❌ Problema 3: Erro 401 (não autenticado)

### Sintomas:
```
❌ Network mostra: GET /api/planet-state → 401
❌ Console: "authenticated: false"
❌ Requisições têm status 401
```

### Causa mais comum:
Token não está sendo enviado com a requisição!

### Checklist:

```bash
# 1. Verificar cookie no DevTools
F12 → Application → Cookies → localhost:3000
# Deve haver um "auth_token" com valor

# 2. Verificar se cookie está sendo enviado
F12 → Network → Clique em /api/planet-state
# Headers → Request Headers → Cookie
# Deve conter "auth_token=xxxxx"

# 3. Verificar credentials
# Buscar por "credentials:" no código
grep -r "credentials:" hooks/usePlanetState.ts
# Deve mostrar: credentials: 'include'
```

### Soluções:

**A. Cookie não está sendo setado:**

```typescript
// app/api/auth/login/route.ts linha ~57
response.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60,
});
```

Certificar-se de que **não há erros** nesta parte.

**B. Cookie está sendo setado, mas fetch não envia:**

```typescript
// ❌ Errado - sem credentials
fetch('/api/planet-state')

// ✅ Certo - com credentials
fetch('/api/planet-state', { credentials: 'include' })
```

Verificar em:
- `hooks/usePlanetState.ts` linha ~103, ~119
- `hooks/usePlanetTodos.ts` linha ~133, ~150

**C. Token expirou:**

```typescript
// .env.local
AUTH_TOKEN_TTL_SECONDS=86400  // 24 horas

// Se mudou para valor menor, token expira rápido
// Solução: fazer logout e login novamente
```

**D. Reset de cookies:**

```bash
# No DevTools Console:
document.cookie = "auth_token=; max-age=0"

# Depois faça login novamente
```

---

## ❌ Problema 4: Dados não sincronizam

### Sintomas:
```
✅ Requisições aparecem (200 OK)
✅ Login funciona
❌ Mas mudança no Dispositivo A não aparece no B
```

### Checklist:

```bash
# 1. Verificar se está salvando em A
F12 → Network → Filtre "POST /api/planet-state"
# Deve aparecer requisição POST quando muda algo

# 2. Verificar response do POST
# Clique no POST → Response
# Deve conter o estado atualizado

# 3. Verificar se GET em B busca novo estado
# No Dispositivo B, aguarde 10 segundos
# Deve aparecer novo GET /api/planet-state
```

### Soluções:

**A. Mudanças não estão sendo salvas (A):**

```bash
# No DevTools Console do Dispositivo A:
# Mude manualmente e veja se POST aparece

# Se não aparecer POST:
# Problema está no save, não no sync
# Verificar hook de save em usePlanetState.ts linhas ~130+
```

**B. Dados são salvos, mas B não está sincronizando:**

```bash
# No Dispositivo B, verificar polling:
# Network → Filtre "planet-state"
# GET deve aparecer a cada ~10 segundos

# Se GET não aparece:
# → Volta a Problema 2 (Não há requisições)

# Se GET aparece mas não atualiza:
# → Problema pode ser no merge de dados
# → Verificar usePlanetTodos mergeTodos() function
```

**C. Ambos salvam, mas não veem mudanças um do outro:**

```typescript
// Problema pode ser localStorage vs servidor
// Verificar prioridade em usePlanetState.ts

// Linhas 30-60: Carregamento inicial
// Se localStorage tem algo, pode sobrescrever servidor

// Solução: Limpar localStorage localmente
sessionStorage.removeItem('planet_state')
localStorage.removeItem('planet_state')
```

---

## 🧠 Debug com Console Logs

Adicionar logs temporários para diagnosticar:

### Em `hooks/usePlanetState.ts`:

```typescript
// Linha ~85, adicionar:
useEffect(() => {
  console.log('🔄 Polling Effect Triggered:', { hasLoaded, isAuthenticated });
  
  if (!hasLoaded || !isAuthenticated) {
    console.log('⏸️ Polling paused: hasLoaded=', hasLoaded, 'isAuthenticated=', isAuthenticated);
    return;
  }

  const syncState = async () => {
    console.log('📡 Syncing state...');
    try {
      const response = await fetch('/api/planet-state', { credentials: 'include' });
      console.log('📥 Response:', { status: response.status, ok: response.ok });
      if (response.ok) {
        const data = await response.json();
        console.log('✅ State synced:', data);
        setState(data?.state ?? {});
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
    }
  };

  syncState(); // Primeira vez
  
  const intervalId = setInterval(syncState, 10000);
  
  return () => clearInterval(intervalId);
}, [hasLoaded, isAuthenticated]);
```

**Esperado no Console:**
```
🔄 Polling Effect Triggered: { hasLoaded: true, isAuthenticated: true }
📡 Syncing state...
📥 Response: { status: 200, ok: true }
✅ State synced: { ... dados ... }
📡 Syncing state...
📥 Response: { status: 200, ok: true }
✅ State synced: { ... dados ... }
```

---

## 🎯 Teste Passo a Passo com Debug

### Passo 1: Verificar API direto

```bash
# Terminal: Testar endpoint direto
curl -X GET http://localhost:3000/api/planet-state \
  -H "Cookie: auth_token=SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"

# Esperado: 200 com dados do estado
# Se 401: Token inválido ou não setado
# Se 500: Erro no servidor
```

### Passo 2: Verificar browser sem polling

```javascript
// No DevTools Console após login:
const response = await fetch('/api/planet-state', { credentials: 'include' });
const data = await response.json();
console.log({ status: response.status, data });

// Esperado: status 200 com dados
```

### Passo 3: Verificar setInterval

```javascript
// No DevTools Console:
setInterval(async () => {
  const response = await fetch('/api/planet-state', { credentials: 'include' });
  console.log(new Date().toLocaleTimeString(), 'Status:', response.status);
}, 10000);

// Deixe rodando 30 segundos
// Esperado: 3 logs com status 200
```

---

## 🔍 Verificar Logs do Servidor

```bash
# Terminal onde npm run dev está rodando:
# Procure por logs como:

# ✅ Sucesso:
# GET /api/planet-state 200 in Xms

# ❌ Falha:
# GET /api/planet-state 401 - no token
# GET /api/planet-state 500 - error in database
```

---

## 📊 Matriz de Diagnóstico

| Sintoma | Login | Network | Status | Likely Issue | Solução |
|---------|-------|---------|--------|--------------|---------|
| Não consigo logar | ❌ | N/A | N/A | Auth ou DB | [Problema 1](#problema-1-autenticacao-falhando) |
| Login ok, sem requisições | ✅ | ❌ | N/A | Polling não iniciou | [Problema 2](#problema-2-nao-ha-requisicoes-de-sync) |
| Login ok, 401 na sync | ✅ | ✅ | 401 | Token não enviado | [Problema 3](#problema-3-erro-401-nao-autenticado) |
| Requisições 200, sem sync | ✅ | ✅ | 200 | Dados não atualizando | [Problema 4](#problema-4-dados-nao-sincronizam) |

---

## 🚨 Últimas tentativas (nuclear option)

Se nada funcionar:

```bash
# 1. Limpar tudo
rm -rf .next node_modules package-lock.json

# 2. Reinstalar
npm install

# 3. Deletar DB cache local (cuidado!)
# Seu .env.local aponta para Neon, então isso é seguro
# Mas faça backup antes

# 4. Rodar novamente
npm run dev

# 5. Se ainda falhar:
# Checar status do Neon dashboard
# https://console.neon.tech
# Database pode estar offline
```

---

## 📞 Informações para debugar

Se pedir ajuda, forneça:

```bash
# 1. Versão do Node
node --version

# 2. Logs do dev server
npm run dev 2>&1 | head -50

# 3. Logs do browser (F12 Console)
# Print screenshot ou copie erros

# 4. Response do /api/planet-state
# F12 → Network → Clique em planet-state
# → Response tab → copie JSON

# 5. Status do cookie
# F12 → Application → Cookies
# Mostrar se auth_token está lá
```

---

**Qual desses problemas você está enfrentando? Deixe-me saber o status dos checks acima!** 🚀
