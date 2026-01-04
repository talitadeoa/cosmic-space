# 🎯 Guia Visual: Testar Sincronização no DevTools

## 📺 Setup: 2 Telas lado a lado

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│         ABA A (Esquerda)             │         ABA B (Direita)              │
├──────────────────────────────────────┼──────────────────────────────────────┤
│  localhost:3000/cosmos/planeta       │  localhost:3000/cosmos/planeta       │
│                                      │                                      │
│  ┌────────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │ F12 DevTools (Network tab)     │  │  │ Planeta visível aqui           │  │
│  │ Filtre: planet-state           │  │  │                                │  │
│  │ Mostra requisições a cada 10s  │  │  │ Aguarda sincronização...       │  │
│  │                                │  │  │                                │  │
│  └────────────────────────────────┘  │  └────────────────────────────────┘  │
│                                      │                                      │
│ Ação: Mude nome do planeta          │ Resultado: Vê mudança em ~10s        │
│       Vê POST em Network             │ Network mostra novo GET              │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 🔍 Passo 1: Abrir DevTools corretamente

### Aba A (que será modificada):

```
1. Abra http://localhost:3000/cosmos/planeta
2. Pressione F12 (ou Ctrl+Shift+I)
3. Clique em "Network" tab
4. Faça login
5. Na caixa "Filter URLs" digite: planet-state
   (deixe vazio se quer ver TUDO)
```

**Esperado:**
```
GET /api/planet-state
GET /api/planet-state  (após 10 segundos)
GET /api/planet-state  (após 10 segundos)
...
```

### Aba B (que receberá sincronização):

```
1. Abra http://localhost:3000/cosmos/planeta (outra aba)
2. Não precisa de DevTools nesta (mas pode abrir para verificar)
3. Faça login com MESMA CONTA de A
4. Deixe aberta, apenas observe
```

---

## 📡 Passo 2: Entender as requisições

### GET (Polling automático)

```
🔵 GET /api/planet-state

Headers enviados:
├─ Cookie: auth_token=xxxxx
├─ Credentials: include
└─ Host: localhost:3000

Response esperado:
├─ Status: 200 ✅
├─ Body: { state: { ... dados ... } }
└─ Time: ~50-200ms
```

**O que significa:**
- Aba B está **buscando** o estado do servidor
- Funciona a cada 10 segundos
- Se aparecer = Sincronização funcionando

---

### POST (Ao salvar mudança)

```
🟢 POST /api/planet-state

Headers enviados:
├─ Cookie: auth_token=xxxxx
├─ Content-Type: application/json
└─ Body: { state: { nome: "novo nome", ... } }

Response esperado:
├─ Status: 200 ✅
├─ Body: { state: { nome: "novo nome", ... } }
└─ Time: ~100-500ms
```

**O que significa:**
- Aba A está **salvando** mudança no servidor
- Acontece com pequeno debounce (~800ms após editar)

---

## 🧪 Passo 3: Teste prático

### Scenario A: Salvar em A, sincronizar em B

```
⏱️ T+0s:
├─ Abra Aba A e B (lado a lado)
├─ Faça login em ambas
└─ Network tab em A mostra GETs periódicos ✅

⏱️ T+5s:
├─ Na Aba A: Clique em um planeta
├─ Mude o NOME do planeta
└─ Network em A mostra:
   POST /api/planet-state → 200 ✅

⏱️ T+10s:
├─ Aguarde até 10 segundos
├─ Network em A mostra novo:
   GET /api/planet-state → 200 ✅
└─ Aba B ainda não atualizou

⏱️ T+15s:
├─ Network em B agora mostra:
   GET /api/planet-state → 200 ✅
└─ ⭐ Aba B SINCRONIZA com novo nome! ⭐
```

---

## 🔴 Sinais de problemas

### ❌ Problema A: Sem requisições GET

```
Network vazio (sem /api/planet-state)

Diagnóstico:
├─ Autenticação falhou?
├─ isAuthenticated = false?
└─ Polling não iniciou?

Verificar no Console:
```javascript
const { isAuthenticated, loading } = useAuth()
console.log({ isAuthenticated, loading })
// Se { false, false } = problema
```

**Solução:** [Ver Problema 2](TROUBLESHOOTING_SYNC.md#problema-2-nao-ha-requisicoes-de-sync)

---

### ❌ Problema B: Status 401

```
GET /api/planet-state → 401 Unauthorized

Diagnóstico:
├─ Cookie auth_token não está sendo enviado
├─ Token expirou
└─ Credentials não incluído

Verificar:
1. Application → Cookies → auth_token existe?
2. Network → Request Headers → Cookie: auth_token?
3. Código tem credentials: 'include'?
```

**Solução:** [Ver Problema 3](TROUBLESHOOTING_SYNC.md#problema-3-erro-401-nao-autenticado)

---

### ❌ Problema C: Status 200 mas dados não sincronizam

```
Network mostra 200 OK, mas Aba B não atualiza

Diagnóstico:
├─ Response contém dados corretos?
├─ Aba B está fazendo GET periodicamente?
└─ Dados estão sendo salvos corretamente?

Verificar:
1. Clique no GET em Network
2. Response tab
3. { state: { ... } } deve conter dados atualizados
```

**Solução:** [Ver Problema 4](TROUBLESHOOTING_SYNC.md#problema-4-dados-nao-sincronizam)

---

## 📊 Exemplo de Network "correto"

```
┌─ Time ────┬─ Method ┬─ URL ──────────────────────┬─ Status ┬─ Type ─┐
├─ 10:45:32 │  POST   │ /api/auth/login           │  200    │ json   │
├─ 10:45:35 │  GET    │ /api/planet-state         │  200    │ json   │
├─ 10:45:45 │  GET    │ /api/planet-state         │  200    │ json   │
├─ 10:45:48 │  POST   │ /api/planet-state         │  200    │ json   │
├─ 10:45:55 │  GET    │ /api/planet-state         │  200    │ json   │
├─ 10:46:05 │  GET    │ /api/planet-state         │  200    │ json   │
└─ 10:46:15 │  GET    │ /api/planet-state         │  200    │ json   │
```

**O que observar:**
- GET a cada ~10 segundos ✅
- Status sempre 200 ✅
- Quando salva (T+48), POST aparece ✅
- Próximo GET (T+55) traz dados atualizados ✅

---

## 💾 Response esperado

Quando clica em um GET:

```
Response Tab:
┌────────────────────────────────────────┐
│ {                                      │
│   "state": {                           │
│     "selectedPlanet": "marte",         │
│     "planets": [                       │
│       {                                │
│         "id": "1",                     │
│         "name": "Marte",               │
│         "color": "#ff6b6b",            │
│         "energy": "alta",              │
│         "updatedAt": "2026-01-04..."   │
│       },                               │
│       ...                              │
│     ]                                  │
│   }                                    │
│ }                                      │
└────────────────────────────────────────┘
```

**Importante:**
- Todos os campos presentes? ✅
- updatedAt está recente? ✅
- JSON válido (sem erros de sintaxe)? ✅

---

## 🎬 Teste Completo (5 minutos)

### Roteiro passo a passo:

```
[ ] 1. Abra 2 abas lado a lado
[ ] 2. F12 em Aba A, Network tab, filtre "planet-state"
[ ] 3. Faça login em ambas abas
[ ] 4. Aguarde 3 GET automáticos em Aba A (~30 segundos)
[ ] 5. Clique em um planeta em Aba A
[ ] 6. Mude o NOME do planeta
[ ] 7. Veja POST aparecer em Network
[ ] 8. Aguarde 10 segundos
[ ] 9. Veja novo GET em Network
[ ] 10. ⭐ Verifique se nome mudou também em Aba B
```

**Se tudo passou:** Sincronização está funcionando! 🎉

---

## 🚀 Performance Monitoring

### Verificar latência:

```
Network → Clique em GET
Headers → Timing tab

┌─ Queued: Xms
├─ DNS Lookup: Xms
├─ Initial Connection: Xms
├─ SSL/TLS: Xms
├─ Request Sent: Xms
├─ Waiting: Xms (TTFB)
└─ Content Download: Xms
```

**Esperado:**
- Waiting (TTFB) < 500ms = Bom ✅
- Total < 1s = Excelente ✅

---

## 📝 Checklist: DevTools

- [ ] F12 abre corretamente
- [ ] Network tab está ativo
- [ ] Filter está vazio (ou "planet-state")
- [ ] Posso ver requisições após login
- [ ] Status é 200, não 401 ou 404
- [ ] Headers incluem Cookie com auth_token
- [ ] Response é JSON válido
- [ ] Requisições aparecem a cada ~10 segundos

---

**Pronto! Agora você sabe exatamente o que procurar no DevTools para diagnosticar sincronização.** 

Se tiver dúvida sobre o que significa cada requisição, volta aqui! 📖
