# 🔍 DIAGNÓSTICO: Sincronização entre Dispositivos

## ❌ PROBLEMA IDENTIFICADO

O app **não sincroniza inputs entre dispositivos** porque:

### 1. **Falta de Polling Periódico** 🚫

Os hooks `usePlanetState` e `usePlanetTodos` **carregam dados apenas UMA VEZ** ao montar:

```typescript
// hooks/usePlanetState.ts - Linha 22-70
useEffect(() => {
  // ❌ Isso executa UMA VEZ quando o hook monta
  const loadState = async () => {
    // Busca dados do servidor
    const response = await fetch('/api/planet-state', { credentials: 'include' });
    // ...
  };
  loadState();
  
  return () => { isMounted = false; };
}, [isAuthenticated, loading]); // ⚠️ Só refetch quando autenticação muda
```

**Problema:** 
- Usuário abre app no **Dispositivo A** → dados carregados
- Usuário abre app no **Dispositivo B** → dados carregados
- Usuário **muda algo no Dispositivo B**
- **Dispositivo A não sabe que mudou** ❌ (nunca vai buscar novamente)

### 2. **Sincronização é Unidirecional** 🔄❌

Fluxo atual:
```
Local State → [Save com debounce] → Servidor
Servidor → [Load on mount] → Local State

❌ Servidor → [Nunca atualiza] → Local State (exceto no mount)
```

### 3. **Sem Real-time Updates** ⏱️

Não há:
- ❌ WebSocket/SSE para notificações em tempo real
- ❌ Polling periódico para buscar mudanças
- ❌ Listeners de mudanças do servidor
- ❌ Cache invalidation quando dados mudam remotamente

---

## 🎯 SOLUÇÕES (do mais simples ao mais complexo)

### **SOLUÇÃO 1: Polling Periódico (Simples)** ⭐⭐

✅ **Fácil de implementar**
✅ **Funciona com banco atual**
⚠️ Usa mais banda/bateria
⏱️ Atraso até 30 segundos

**Implementação:**
```typescript
const SYNC_INTERVAL_MS = 10000; // 10 segundos

useEffect(() => {
  const intervalId = setInterval(async () => {
    if (isAuthenticated && hasLoaded) {
      try {
        const response = await fetch('/api/planet-state', 
          { credentials: 'include' }
        );
        const remoteState = await response.json();
        
        // ✅ Atualiza se o servidor tiver versão mais recente
        if (remoteState.updatedAt > lastLocalUpdateAt) {
          setState(remoteState.state);
        }
      } catch (error) {
        console.warn('Falha ao sincronizar:', error);
      }
    }
  }, SYNC_INTERVAL_MS);

  return () => clearInterval(intervalId);
}, [isAuthenticated, hasLoaded]);
```

**Arquivo: `hooks/usePlanetState.ts`**

---

### **SOLUÇÃO 2: Broadcast Channel API (Médio)** ⭐⭐⭐

✅ **Sincroniza abas/janelas do mesmo dispositivo**
✅ **Rápido e sem servidor**
⚠️ Não funciona entre dispositivos diferentes

**Implementação:**
```typescript
const channel = new BroadcastChannel('planet-state-sync');

// Quando estado local muda
setState(newState);
channel.postMessage({ type: 'state-updated', state: newState });

// Ouvir mudanças de outras abas
channel.onmessage = (event) => {
  if (event.data.type === 'state-updated') {
    setState(event.data.state);
  }
};
```

**Bom para:** Sincronizar 2+ abas abertas no mesmo navegador

---

### **SOLUÇÃO 3: WebSocket + Servidor (Melhor)** ⭐⭐⭐⭐⭐

✅ **Tempo real**
✅ **Funciona entre dispositivos**
✅ **Eficiente (servidor notifica cliente)**
❌ Complexidade: Requer upgrade do servidor

**Arquitetura:**
```
Dispositivo A → WebSocket → Servidor → WebSocket → Dispositivo B
                                    ↓
                            Banco de Dados
```

**Requer:**
1. Socket.IO ou ws server
2. Gerenciador de conexões
3. Broadcast de mudanças entre clientes

---

## 📊 COMPARAÇÃO DE SOLUÇÕES

| Solução | Custo Dev | Latência | Banda | Real-time | Multi-device |
|---------|-----------|----------|-------|-----------|--------------|
| Polling | ⭐ | ~10s | Média | ✅ | ✅ |
| BroadcastChannel | ⭐⭐ | <100ms | Nenhuma | ✅ | ❌ |
| WebSocket | ⭐⭐⭐⭐ | <100ms | Baixa | ✅ | ✅ |

---

## 🔧 PROBLEMA ATUAL NA ARQUITETURA

### Hook: `usePlanetState.ts` (Linha 22-70)

```typescript
useEffect(() => {
  if (loading) return;
  let isMounted = true;

  const loadState = async () => {
    // ... código ...
  };

  loadState(); // ⚠️ Chamada UMA VEZ

  return () => { isMounted = false; };
}, [isAuthenticated, loading]); // ⚠️ Dependency array: só muda na autenticação
```

**Problema:**
- Se estado muda no servidor, este hook nunca vai buscar de novo
- Mudanças são salvas COM sucesso no servidor
- Mas outras abas/dispositivos nunca sabem disso

### Hook: `usePlanetTodos.ts` (Mesmo problema)

Mesma arquitetura que `usePlanetState`:
- Carrega na montagem
- Salva com debounce
- Nunca verifica servidor novamente

### Componente: `EmotionalInput.tsx`

Usa `useEmotionalInput` que:
- Salva no localStorage
- ❌ Não sincroniza com servidor entre dispositivos

---

## 📝 CHECKLIST: O QUE FALTA

- ❌ Polling periódico nos hooks
- ❌ Timestamp de última atualização (`updatedAt`)
- ❌ Detecção de conflitos (versão local vs remota)
- ❌ Sincronização em tempo real
- ❌ Indicador visual de status de sincronização
- ❌ Tratamento de offline/online

---

## 🚀 PRÓXIMOS PASSOS (Recomendado)

### Fase 1: Polling Simples (1-2 horas) ✅
1. Adicionar `SYNC_INTERVAL_MS = 10000` nos hooks
2. Implementar polling periódico
3. Testar em 2 abas/dispositivos
4. ✅ Resultado: Sincronização em ~10 segundos

### Fase 2: BroadcastChannel (30 min) ✅
1. Adicionar sincronização entre abas
2. Melhor UX para múltiplas abas
3. ✅ Resultado: Sincronização instantânea na mesma máquina

### Fase 3: WebSocket (8-16 horas) 🔮
1. Setup Socket.IO server
2. Upgrade arquitetura
3. Broadcast entre clientes
4. ✅ Resultado: Real-time sync entre dispositivos

---

## 🎯 RECOMENDAÇÃO FINAL

**Comece com SOLUÇÃO 1 (Polling):**
- Fácil de implementar
- Resolve o problema imediato
- Depois adiciona BroadcastChannel para melhor UX
- Depois considera WebSocket se necessário

Tempo estimado: **2-3 horas** para ficar funcional
