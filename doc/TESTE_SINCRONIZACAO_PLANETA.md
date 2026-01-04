# 🧪 Teste: Sincronização de Planeta entre Dispositivos

## ✅ O que foi corrigido

O problema era que o polling de sincronização iniciava **antes** do token de autenticação estar pronto. Agora:

1. ✅ **Delay de 100ms** garantido antes da primeira sincronização
2. ✅ **Polling periódico a cada 10 segundos** após autenticação bem-sucedida
3. ✅ **Sincronização automática** de estado do planeta e tarefas entre dispositivos

---

## 🧪 Como testar (3 passos)

### 1️⃣ Abra em 2 dispositivos diferentes (ou 2 abas)

**Dispositivo A (Notebook):**
```
localhost:3000/cosmos/planeta
```

**Dispositivo B (Celular ou outra aba):**
```
localhost:3000/cosmos/planeta
```

### 2️⃣ Faça login com a mesma conta em ambos

- Faça login no Dispositivo A
- Faça login no Dispositivo B
- Aguarde 2-3 segundos para o polling iniciar

### 3️⃣ Teste a sincronização

**Dispositivo A:**
- Clique em um planeta
- Mude o **nome**, **cor** ou **energia**
- Veja salvar localmente

**Dispositivo B:**
- Aguarde **até 10 segundos**
- O planeta deve atualizar automaticamente com os novos dados
- ✅ Sincronizado!

---

## 📊 Como verificar no DevTools

**F12 → Network Tab**

1. Filtre por `planet-state` e `planet-todos`
2. Ao fazer login, devem aparecer requisições `GET` para essas APIs
3. A cada 10 segundos, deve aparecer uma nova requisição de sincronização
4. Se mudar algo no Dispositivo A:
   - Dispositivo A faz `POST` para salvar
   - Dispositivo B recebe `GET` com os novos dados

### Exemplo de requisições esperadas:

```
GET /api/planet-state (após login)
POST /api/planet-state (ao salvar)
GET /api/planet-state (a cada 10s)

GET /api/planet-todos (após login)
POST /api/planet-todos (ao salvar)
GET /api/planet-todos (a cada 10s)
```

---

## 🔧 Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `hooks/usePlanetState.ts` | ✅ Refatorado polling com delay de 100ms |
| `hooks/usePlanetTodos.ts` | ✅ Refatorado polling com delay de 100ms |

### O que mudou:

**Antes:**
```typescript
// ❌ Problema: IIFE async sem garantia de timing
(async () => {
  const response = await fetch('/api/planet-state', ...);
  // Token pode não estar pronto
})();
```

**Depois:**
```typescript
// ✅ Solução: setTimeout garante que token está pronto
const immediateTimeoutRef = setTimeout(() => {
  syncState(); // 100ms de delay
}, 100);
```

---

## ⏱️ Timing da sincronização

```
T+0ms:    Autenticação completada
T+100ms:  Primeira sincronização (com delay para garantir token)
T+10.1s:  Segunda sincronização (polling periódico)
T+20.1s:  Terceira sincronização
T+30.1s:  Quarta sincronização
...
```

---

## ✨ Fluxo completo após login

```
┌─────────────────────────────────────────────────────────┐
│  1. Usuário faz login                                   │
└────────────────────┬──────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  2. Token é setado no cookie (auth_token)              │
│     isAuthenticated = true                              │
└────────────────────┬──────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  3. useEffect de polling dispara                        │
│     hasLoaded && isAuthenticated = true                 │
└────────────────────┬──────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  4. setTimeout(syncState, 100) executa                  │
│     Fetch /api/planet-state com credentials: 'include' │
│     Token é enviado no cookie                           │
└────────────────────┬──────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│  5. setInterval inicia (a cada 10 segundos)            │
│     Sincronização contínua entre dispositivos           │
└─────────────────────────────────────────────────────────┘
```

---

## 🚨 Possíveis problemas

### Se o estado não sincroniza:

1. **Verifique o Network tab:**
   - As requisições `GET /api/planet-state` aparecem?
   - Status é 200 ou 401?

2. **Se status é 401:**
   - Token pode estar expirado
   - Faça logout e login novamente

3. **Se não há requisições:**
   - Console pode estar mostrando erros
   - Abra F12 → Console e procure por "Falha ao sincronizar"

### Se sincroniza lentamente:

- Máximo de espera é 10 segundos entre sincronizações
- Se precisa mais rápido, diminua `SYNC_INTERVAL_MS` em:
  - `hooks/usePlanetState.ts`
  - `hooks/usePlanetTodos.ts`

Exemplo (5 segundos em vez de 10):
```typescript
const SYNC_INTERVAL_MS = 5000; // 5 segundos
```

---

## ✅ Checklist de funcionamento

- [ ] Fiz login nos 2 dispositivos com a mesma conta
- [ ] Aguardei 2-3 segundos após login
- [ ] Modifiquei algo no Dispositivo A
- [ ] Aguardei 10 segundos
- [ ] Vi a mudança aparecer no Dispositivo B
- [ ] No Network tab, vejo requisições periódicas de `/api/planet-state`
- [ ] Status das requisições é 200 (sucesso)

---

## 📞 Próximas melhorias (futuro)

1. Adicionar BroadcastChannel para sincronização instantânea entre abas do mesmo navegador
2. Considerar WebSocket para sincronização em tempo real entre dispositivos
3. Adicionar indicador visual de "sincronizando..." no UI
4. Mostrar timestamp da última sincronização

Bom teste! 🚀
