# 📚 Índice: Guias de Sincronização

## 🚀 Quick Links

### Para começar rápido:
1. **[TESTE_SINCRONIZACAO_PLANETA.md](TESTE_SINCRONIZACAO_PLANETA.md)** - Como testar em 3 passos
2. **[DEVTOOLS_SYNC_GUIDE.md](DEVTOOLS_SYNC_GUIDE.md)** - Entender o que ver no DevTools

### Para diagnosticar problemas:
3. **[TROUBLESHOOTING_SYNC.md](TROUBLESHOOTING_SYNC.md)** - Solucionar cada problema
4. **[scripts/diagnose-sync.sh](../scripts/diagnose-sync.sh)** - Script automático de diagnóstico

### Para entender a arquitetura:
5. **[DEV_VS_PROD_SYNC.md](DEV_VS_PROD_SYNC.md)** - Diferenças entre dev e produção

---

## 📋 Passo 1: Executar Diagnóstico

```bash
# Terminal
bash scripts/diagnose-sync.sh

# Resultado:
# ✅ Tudo pronto! Execute: npm run dev
```

Se tudo passar, vá para **Passo 2**.
Se falhar, vá para **TROUBLESHOOTING_SYNC.md**.

---

## 🚀 Passo 2: Rodar o App

```bash
npm run dev
# Aguarde: "▲ Next.js ... ready on http://localhost:3000"
```

---

## 🧪 Passo 3: Testar Sincronização

### Via Quick Test (mais rápido):

```bash
# Abra 2 abas manualmente
open http://localhost:3000/cosmos/planeta  # Aba A
open http://localhost:3000/cosmos/planeta  # Aba B

# 1. Faça login em ambas
# 2. Mude algo na Aba A
# 3. Aguarde 10 segundos
# 4. Veja sincronizar na Aba B ✅
```

### Via DevTools (para ver o que está acontecendo):

Ver [DEVTOOLS_SYNC_GUIDE.md](DEVTOOLS_SYNC_GUIDE.md) para instruções passo a passo com screenshots.

---

## ❌ Problema? Use este fluxo:

```
1. Rodou diagnóstico?
   bash scripts/diagnose-sync.sh
   
   ❌ Falhou? → [TROUBLESHOOTING_SYNC.md](TROUBLESHOOTING_SYNC.md#problema-1)

2. App rodando?
   npm run dev
   
   ❌ Erro? → [TROUBLESHOOTING_SYNC.md](TROUBLESHOOTING_SYNC.md)

3. Login funcionando?
   Faça login em ambas abas
   
   ❌ Falha? → [TROUBLESHOOTING_SYNC.md#problema-1](TROUBLESHOOTING_SYNC.md#problema-1-autenticacao-falhando)

4. Vê requisições de sync?
   F12 → Network → Filtre "planet-state"
   
   ❌ Nada? → [TROUBLESHOOTING_SYNC.md#problema-2](TROUBLESHOOTING_SYNC.md#problema-2-nao-ha-requisicoes-de-sync)

5. Requisições têm status 200?
   Clique em uma requisição GET
   
   ❌ 401? → [TROUBLESHOOTING_SYNC.md#problema-3](TROUBLESHOOTING_SYNC.md#problema-3-erro-401-nao-autenticado)

6. Dados sincronizam?
   Mude algo na Aba A, aguarde 10s, veja na Aba B
   
   ❌ Nada? → [TROUBLESHOOTING_SYNC.md#problema-4](TROUBLESHOOTING_SYNC.md#problema-4-dados-nao-sincronizam)

✅ Sincronização funcionando!
```

---

## 📖 Documentação por aspecto

### Entendimento técnico

| Tópico | Arquivo |
|--------|---------|
| Como a sincronização funciona | [TESTE_SINCRONIZACAO_PLANETA.md](TESTE_SINCRONIZACAO_PLANETA.md#fluxo-completo-após-login) |
| Dev vs Prod | [DEV_VS_PROD_SYNC.md](DEV_VS_PROD_SYNC.md) |
| O que ver no DevTools | [DEVTOOLS_SYNC_GUIDE.md](DEVTOOLS_SYNC_GUIDE.md) |

### Solução de problemas

| Problema | Arquivo |
|----------|---------|
| Não consigo fazer login | [TROUBLESHOOTING_SYNC.md#problema-1](TROUBLESHOOTING_SYNC.md#problema-1-autenticacao-falhando) |
| Sem requisições de sync | [TROUBLESHOOTING_SYNC.md#problema-2](TROUBLESHOOTING_SYNC.md#problema-2-nao-ha-requisicoes-de-sync) |
| Erro 401 nas requisições | [TROUBLESHOOTING_SYNC.md#problema-3](TROUBLESHOOTING_SYNC.md#problema-3-erro-401-nao-autenticado) |
| Dados não sincronizam | [TROUBLESHOOTING_SYNC.md#problema-4](TROUBLESHOOTING_SYNC.md#problema-4-dados-nao-sincronizam) |
| Debug com console logs | [TROUBLESHOOTING_SYNC.md#🧠-debug-com-console-logs](TROUBLESHOOTING_SYNC.md) |

### Teste e validação

| Atividade | Arquivo |
|-----------|---------|
| Teste rápido em 3 passos | [TESTE_SINCRONIZACAO_PLANETA.md](TESTE_SINCRONIZACAO_PLANETA.md#-como-testar-3-passos) |
| Teste com DevTools | [DEVTOOLS_SYNC_GUIDE.md](DEVTOOLS_SYNC_GUIDE.md) |
| Verificar requisições | [DEVTOOLS_SYNC_GUIDE.md#-passo-2-entender-as-requisições](DEVTOOLS_SYNC_GUIDE.md) |

---

## 🔑 Conceitos-chave

### Polling
Sincronização que acontece a cada 10 segundos (automática)

**Onde acontece:**
- `hooks/usePlanetState.ts` linha ~85
- `hooks/usePlanetTodos.ts` linha ~115

**Como funciona:**
```typescript
setInterval(() => {
  // A cada 10 segundos, busca do servidor
  fetch('/api/planet-state', { credentials: 'include' })
}, 10000)
```

### Credentials
Envia o cookie de autenticação com a requisição

**Por que precisa:**
```typescript
// ❌ Sem credentials - servidor não sabe quem é
fetch('/api/planet-state')

// ✅ Com credentials - envia auth_token no cookie
fetch('/api/planet-state', { credentials: 'include' })
```

### Token (auth_token)
Cookie que prova que você está autenticado

**Setado ao fazer login:**
```typescript
response.cookies.set('auth_token', token, {
  httpOnly: true,     // Protegido contra JS
  secure: true,       // Apenas HTTPS em prod
  sameSite: 'lax',    // Proteção CSRF
  maxAge: 24 * 60 * 60  // 24 horas
})
```

---

## 🛠️ Ferramentas úteis

### Diagnóstico automático
```bash
bash scripts/diagnose-sync.sh
```

### Testar API direto
```bash
# Após fazer login, copie o token dos DevTools
curl -H "Cookie: auth_token=SEU_TOKEN" \
  http://localhost:3000/api/planet-state
```

### Ver logs do servidor
Rode `npm run dev` e procure por linhas como:
```
GET /api/planet-state 200 in 45ms
POST /api/planet-state 200 in 128ms
```

---

## ✅ Checklist: Antes de considerar "pronto"

- [ ] Diagnóstico passou (`bash scripts/diagnose-sync.sh`)
- [ ] App rodando sem erros (`npm run dev`)
- [ ] Login funcionando em ambas abas
- [ ] DevTools mostra GET periódicos para /api/planet-state
- [ ] Status das requisições é 200
- [ ] Mudança em Aba A aparece em Aba B após ~10s
- [ ] Não há erros no console (F12 → Console)
- [ ] Não há 401 (Unauthorized) nas requisições

---

## 📞 Se ainda tiver dúvida

1. Verifique qual etapa está falhando
2. Procure aquela etapa em [TROUBLESHOOTING_SYNC.md](TROUBLESHOOTING_SYNC.md)
3. Siga a solução passo a passo
4. Se continuar falhando, forneça:
   - Saída de `bash scripts/diagnose-sync.sh`
   - Saída de `npm run dev` (primeiras 50 linhas)
   - Screenshot do DevTools mostrando:
     - Network tab
     - Console com erros
     - Application → Cookies → auth_token

---

**Bom teste! 🚀**

Se conseguir fazer sincronizar, parabéns! 🎉
Se ficar preso, os guias acima têm a solução! 📖
