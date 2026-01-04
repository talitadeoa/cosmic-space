# ⚡ QUICK START: Testar Sincronização em 2 Minutos

## 1️⃣ Abra 2 ABAS

```
Aba A: localhost:3000/cosmos/planeta
Aba B: localhost:3000/cosmos/planeta
```

## 2️⃣ MUDE ALGO NA ABA A

Clique em qualquer planeta e:
- Mude o nome
- Mude a cor
- Mude qualquer propriedade

Veja salvar ✅

## 3️⃣ AGUARDE 10 SEGUNDOS ⏱️

Veja a mudança aparecer **automaticamente** na Aba B ✅

## 4️⃣ TESTE TAMBÉM

### Tarefas
- Adicione uma tarefa na Aba A
- Aguarde 10s
- Veja aparecer na Aba B ✅

### Em Dispositivos Diferentes
- Abra em um celular + notebook
- Mude algo em um
- Aguarde 10s
- Veja sincronizar ✅

---

## 🔍 VERIFICAR NO BROWSER

**F12 → Network**

Procure por:
```
GET /api/planet-state
GET /api/planet-todos
```

A cada 10 segundos deve aparecer uma requisição nova ✅

---

## 🎯 RESULTADO ESPERADO

```
Tempo    Aba A (Notebook)         Aba B (Celular)
────     ──────────────────       ─────────────────
0s       [muda estado]            [estado antigo]
         └─► Salva no servidor
5s       [estado novo]            [estado antigo]
                                  └─► Verifica servidor
10s      [estado novo]            [estado novo] ✅
```

---

## ❌ NÃO FUNCIONOU?

### Verifique:
1. **Está autenticado** em ambas as abas?
2. **Mesma conta** nas 2 abas?
3. **Navegador permite localStorage**? (Não em anônimo)
4. **Aguardou 10 segundos**? (Não são instantâneos)

### Debug:
```javascript
// No console (F12):
// Veja últimas requisições de sync
fetch('/api/planet-state').then(r => r.json()).then(console.log)
```

---

## 📚 Leia Mais

- `doc/SINCRONIZACAO_RESUMO.md` - Visão geral
- `doc/IMPLEMENTACAO_SINCRONIZACAO.md` - Guia completo
- `doc/DIAGNOSTICO_SINCRONIZACAO.md` - Análise técnica
- `doc/SINCRONIZACAO_VISUAL.md` - Diagrama visual

---

**Pronto! Sincronização está ativa! 🚀**
