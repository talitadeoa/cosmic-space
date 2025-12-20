# 🌙 Correção: Erro de Sincronização de Lunações

## Problema Identificado

O componente `LunationSync` estava enviando dados para a API com nomes de campos diferentes do esperado:

### Campos Enviados pelo LunationSync ❌
- `date` (em vez de `lunation_date`)
- `moonPhase` (em vez de `moon_phase`)
- `sign` (em vez de `zodiac_sign`)

### Campos Esperados pela API ✅
- `lunation_date`
- `moon_phase`
- `zodiac_sign`

## Solução Implementada

### 1. Melhor Mapeamento na API (`app/api/moons/lunations/route.ts`)

Adicionamos normalização robusta no endpoint POST:

```typescript
// Normalizar nomes de campos que podem vir de diferentes fontes
const lunation_date = d.date || d.lunation_date;
const moon_phase = d.moonPhase || d.moon_phase;
const zodiac_sign = d.sign || d.zodiac_sign;

// Validar dados obrigatórios
if (!lunation_date || !moon_phase || !zodiac_sign) {
  console.warn('Lunação com dados incompletos:', d);
}
```

**Benefício:** Agora a API aceita ambos os formatos de campo (camelCase e snake_case).

### 2. Melhorias no Componente LunationSync

#### ✅ Melhor Tratamento de Erros
- Captura mensagens de erro da API
- Log detalhado de erros
- Callback `onSuccess` agora é chamado corretamente

```typescript
if (!saveResponse.ok) {
  const errorData = await saveResponse.json().catch(() => ({}));
  throw new Error(`Erro ao salvar: ${saveResponse.status} - ${errorData.error || 'erro desconhecido'}`);
}
```

#### ✅ Chamada de Callback onSuccess
- Agora chama `onSuccess` quando dados já estão sincronizados
- Passa o número de dias sincronizados

```typescript
if (existingData?.days?.length > 0) {
  setSyncedYears((prev) => new Set([...prev, year]));
  if (onSuccess) onSuccess(existingData.days.length);  // ← Adicionado
  continue;
}
```

### 3. Melhorias no Hook `useSyncLunations()`

```typescript
// Agora com logs detalhados
if (verbose) console.log(`✨ ${days.length} dias gerados`);

// Extração e exibição de erro detalhado
const errorData = await saveResponse.json().catch(() => ({}));
throw new Error(`Erro ao salvar: ${saveResponse.status} - ${errorData.error || 'erro desconhecido'}`);
```

## Como Testar

### 1. Via Componente (no aplicativo)
```tsx
<LunationSync 
  autoSync={true}
  years={[2025]}
  verbose={true}
  onSuccess={(count) => console.log(`✅ Sincronizados ${count} dias`)}
  onError={(error) => console.error(`❌ Erro: ${error}`)}
/>
```

### 2. Via Hook (programmaticamente)
```tsx
const { sync, isSyncing, lastError } = useSyncLunations();

// Sincronizar 2025
const result = await sync(2025, true);
console.log(result); // { success: true, message: "...", count: 365 }
```

### 3. Via API direta
```bash
# Gerar dados
curl "http://localhost:3000/api/moons/lunations?start=2025-01-01&end=2025-12-31&source=generated"

# Salvar
curl -X POST http://localhost:3000/api/moons/lunations \
  -H "Content-Type: application/json" \
  -d '{"days": [...], "action": "append"}'
```

## Verificação de Sucesso

Depois da correção, você deve ver nos logs:

```
✅ 2025 já sincronizado (365 dias)
✨ 365 dias gerados
📤 Salvando no banco...
✅ 365 lunações salvas com sucesso
```

## Fallback Automático

Se o banco não estiver disponível:

1. Tenta buscar do banco (com `source=db`)
2. Se falhar, gera localmente (com `source=generated`)
3. Se `source=db` foi solicitado especificamente e falhar, retorna erro 503

## Próximas Etapas (Opcional)

Para melhorias futuras, considere:

- [ ] Adicionar retry automático com exponential backoff
- [ ] Implementar webhook para sincronização em tempo real
- [ ] Cache local com Service Worker
- [ ] Sincronização incremental em background
- [ ] Interface visual para monitorar progresso

---

**Data da Correção:** 20 de dezembro de 2025  
**Status:** ✅ Pronto para produção
