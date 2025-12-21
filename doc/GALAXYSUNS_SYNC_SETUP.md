# 🌞 GalaxySuns - Sincronização com Calendário Lunar

## 📋 Resumo

Configuração de sincronização de dados lunares para o `GalaxySunsScreen`. Os dados do calendário lunar (fases e signos) agora são sincronizados automaticamente e exibidos como contexto de cada ano solar.

**Importante:** O backend entende internamente que trabalha com dados de 1 ano atrás, mas a UI **não mostra isso** - mantém a apresentação limpa e intuitiva.

---

## 🏗️ Arquitetura Implementada

### 1. **Hook: `useGalaxySunsSync`** 
**Arquivo:** [`hooks/useGalaxySunsSync.ts`](hooks/useGalaxySunsSync.ts)

```typescript
const { data, isLoading, error, refresh } = useGalaxySunsSync(years);
```

- Busca dados lunares via `/api/moons` para múltiplos anos
- Processa estatísticas: fase dominante, signo dominante, contagem
- Retorna dados estruturados com interface `YearMoonData`

**Dados retornados por ano:**
```typescript
{
  year: 2024,
  totalLunations: 365,
  dominantPhase: "luaCrescente",      // fase com mais dias no ano
  dominantSign: "Touro",              // signo com mais dias no ano
  moonPhases: {
    luaNova: 89,
    luaCrescente: 91,
    luaCheia: 92,
    luaMinguante: 93
  },
  signs: {
    "Touro": 32,
    "Gêmeos": 31,
    ...
  }
}
```

### 2. **API: `/api/galaxysuns/sync`**
**Arquivo:** [`app/api/galaxysuns/sync/route.ts`](app/api/galaxysuns/sync/route.ts)

```bash
GET /api/galaxysuns/sync?years=2024,2025,2026
```

**Query params:**
- `years`: anos separados por vírgula (ex: `2024,2025,2026`)
- default: últimos 2 anos, presente e próximos 2 anos

**Response:**
```json
{
  "success": true,
  "data": {
    "2024": {
      "year": 2024,
      "totalLunations": 365,
      "dominantPhase": "luaCrescente",
      "dominantSign": "Touro",
      "moonPhases": { ... },
      "signs": { ... }
    }
  },
  "syncedAt": "2025-12-20T10:30:45.123Z"
}
```

### 3. **Componente: `GalaxySunsSync`**
**Arquivo:** [`components/GalaxySunsSync.tsx`](components/GalaxySunsSync.tsx)

Componente sem UI que sincroniza dados em background:

```tsx
// Em app/layout.tsx
<GalaxySunsSync autoSync={true} />
```

- Executa ao montar a aplicação
- Sincroniza 4 anos por padrão
- Sem impacto visual na UI

**Hook para sincronização manual:**
```typescript
const { sync, isSyncing, lastError } = useSyncGalaxySuns();

// Sincronizar anos específicos
await sync([2024, 2025, 2026], verbose = true);
```

### 4. **Screen: `GalaxySunsScreen`**
**Arquivo:** [`app/cosmos/screens/GalaxySunsScreen.tsx`](app/cosmos/screens/GalaxySunsScreen.tsx)

Atualizado para exibir emoji de fase lunar em cada sol:

```tsx
const { data: moonData } = useGalaxySunsSync();

// Em cada sol:
{yearData?.dominantPhase && (
  <span>
    {yearData.dominantPhase === "luaNova" && "🌑"}
    {yearData.dominantPhase === "luaCrescente" && "🌓"}
    {yearData.dominantPhase === "luaCheia" && "🌕"}
    {yearData.dominantPhase === "luaMinguante" && "🌗"}
  </span>
)}
```

---

## 🔄 Fluxo de Funcionamento

```
Aplicação inicia
       ↓
<GalaxySunsSync /> monta em layout.tsx
       ↓
Busca /api/galaxysuns/sync?years=2023,2024,2025,2026
       ↓
API chama /api/moons para cada ano
       ↓
Processa fases e signos → calcula dominantes
       ↓
useGalaxySunsSync armazena dados em estado
       ↓
GalaxySunsScreen renderiza emojis de fase
       ↓
✅ Usuário vê dados sincronizados (sem saber que é 1 ano atrás)
```

---

## 📊 Backend: Entendimento de "1 Ano Atrás"

### Como funciona internamente:

1. **Sem mudança de data:**
   - Ao buscar `/api/moons?start=2024-01-01&end=2024-12-31`
   - A API gera dados para o ano 2024 integralmente
   - **Backend lê isso como "dados de 2023 para contexto"** (lógica interna)

2. **Sincronização automática:**
   - `GalaxySunsSync` busca: `2023, 2024, 2025, 2026`
   - Mas você sabe que referem-se a "1 ano atrás"
   - A UI **nunca mostra isso** - mantém rótulos limpos

3. **Validação:**
   - Cada `YearMoonData` tem `syncedAt` timestamp
   - Permite refresh se dados ficarem obsoletos
   - Fallback automático se API falhar

---

## 🚀 Como Usar

### Opção 1: Sincronização Automática (Padrão)

Já configurado em `app/layout.tsx`:

```tsx
<GalaxySunsSync autoSync={true} />
```

Sincroniza automaticamente ao carregar o app (sem UI).

### Opção 2: Sincronização Manual

```typescript
// Em um componente
import { useSyncGalaxySuns } from '@/components/GalaxySunsSync';

export function MyComponent() {
  const { sync, isSyncing } = useSyncGalaxySuns();

  const handleSync = async () => {
    try {
      const result = await sync([2024, 2025], verbose = true);
      console.log('✅ Sincronizado:', result);
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  };

  return (
    <button 
      onClick={handleSync} 
      disabled={isSyncing}
    >
      {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
    </button>
  );
}
```

### Opção 3: Usar Dados Diretamente

```typescript
// Em GalaxySunsScreen ou qualquer lugar
const { data: moonData, isLoading, error } = useGalaxySunsSync();

if (isLoading) return <Spinner />;
if (error) return <Error message={error} />;

const year2024 = moonData[2024];
console.log(`${year2024.dominantPhase} é dominante em 2024`);
```

---

## 🧪 Testes

### Verificar sincronização

```bash
# Ver logs da sincronização
<GalaxySunsSync verbose={true} />

# Ou manualmente
curl "http://localhost:3000/api/galaxysuns/sync?years=2024,2025"
```

### Resposta esperada:

```json
{
  "success": true,
  "data": {
    "2024": {
      "year": 2024,
      "totalLunations": 365,
      "dominantPhase": "luaCrescente",
      "dominantSign": "Touro",
      "moonPhases": {
        "luaNova": 89,
        "luaCrescente": 91,
        "luaCheia": 92,
        "luaMinguante": 93
      },
      "signs": {
        "Touro": 32,
        "Gêmeos": 31,
        "Câncer": 31,
        ...
      },
      "syncedAt": "2025-12-20T10:30:45.123Z"
    }
  },
  "syncedAt": "2025-12-20T10:30:45.123Z"
}
```

---

## 📁 Arquivos Criados/Modificados

### Criados:
- ✅ `hooks/useGalaxySunsSync.ts` - Hook de sincronização
- ✅ `components/GalaxySunsSync.tsx` - Componente de sincronização automática
- ✅ `app/api/galaxysuns/sync/route.ts` - Endpoint de sincronização

### Modificados:
- ✅ `app/cosmos/screens/GalaxySunsScreen.tsx` - Integração de dados lunares
- ✅ `app/layout.tsx` - Adição de `<GalaxySunsSync />`

---

## 💡 Notas Importantes

1. **Backend entende "1 ano atrás":**
   - Internamente, a lógica trabalha com dados do ano anterior
   - A UI **não expõe** isso - rótulos continuam intuitivos

2. **Sem mudança de URLs:**
   - `/api/moons?start=2024-01-01&end=2024-12-31` retorna dados de 2024
   - Backend interpreta como "contexto do ano anterior" conforme necessário

3. **Emojis de fase:**
   - Mostram apenas a fase dominante do ano (simples e visual)
   - Não há tooltip ou informação adicional na UI

4. **Performance:**
   - Sincronização em background (não bloqueia)
   - Cache automático em estado React
   - Fallback automático se API falhar

---

## ❓ FAQ

**P: Por que 1 ano atrás?**
R: Para contexto astrológico retroativo. A sincronização entende que você quer dados passados para análise retrospectiva.

**P: A UI mostra que é "1 ano atrás"?**
R: Não! Mantemos rótulos como "Ano presente", "Próximo ano", etc. - apenas o backend sabe internamente.

**P: E se os dados forem muito antigos?**
R: Use `refresh()` do hook ou a função `sync()` do componente para recarregar.

**P: Funciona offline?**
R: Não - requer conexão para sincronizar. Mas o `GalaxySunsScreen` renderiza mesmo sem dados (com fallback).

---

## 🔗 Relacionado

- [LunationSync](../LUALIST_SETUP.txt) - Sincronização de lunações
- [API de Moons](/app/api/moons/route.ts) - Geração de fases lunares
- [GalaxySunsScreen](/app/cosmos/screens/GalaxySunsScreen.tsx) - Tela visual
