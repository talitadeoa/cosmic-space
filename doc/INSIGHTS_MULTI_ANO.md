# Backend para Insights Anuais e Trimestrais Multi-Ano

## Problema

Ao clicar nos diferentes sois na página GalaxySuns, ao abrir um sol na tela SolOrbit, o input era sempre para o ano de 2025 (ano atual), independentemente de qual sol foi clicado. Isso impedia que insights fossem registrados para diferentes anos.

## Solução Implementada

### 1. **YearContext** - Contexto Global para Ano Selecionado

📄 `app/cosmos/context/YearContext.tsx` (NOVO)

```typescript
// Componente Provider que mantém o estado do ano selecionado
const YearProvider = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  return <YearContext.Provider value={{ selectedYear, setSelectedYear }}>{children}</YearContext.Provider>;
};

// Hook para acessar o ano selecionado de qualquer componente
const useYear = () => useContext(YearContext);
```

**Responsabilidade:** Compartilhar o ano selecionado globalmente entre toda a aplicação.

---

### 2. **Navegação com Parâmetros de Ano**

📄 `app/cosmos/types.ts` (MODIFICADO)

```typescript
export type ScreenProps = {
  navigateWithFocus: (
    next: ScreenId,
    params: {
      event?: React.MouseEvent<HTMLDivElement>;
      type: CelestialType;
      size?: CelestialSize;
      year?: number; // ✨ NOVO
    }
  ) => void;
};
```

**Mudança:** Adicionado parâmetro `year` à função de navegação.

---

### 3. **GalaxySunsScreen - Passar Ano ao Clicar**

📄 `app/cosmos/screens/GalaxySunsScreen.tsx` (MODIFICADO)

```typescript
// Quando clica em um sol, passa o ano associado
onClick={(e) =>
  navigateWithFocus("solOrbit", {
    event: e,
    type: "sol",
    size: "md",
    year: sun.year,  // ✨ NOVO
  })
}
```

**Fluxo:** GalaxySunsScreen → navigateWithFocus → ano é capturado

---

### 4. **CosmosPage - Gerenciar Ano do Contexto**

📄 `app/cosmos/page.tsx` (MODIFICADO)

**Mudanças principais:**

```typescript
// Envolver com YearProvider
const CosmosPage: React.FC = () => {
  return (
    <AuthGate>
      <YearProvider>
        <CosmosPageContent />
      </YearProvider>
    </AuthGate>
  );
};

// Dentro de CosmosPageContent
const { setSelectedYear } = useYear();

const navigateWithFocus = useCallback<ScreenProps["navigateWithFocus"]>(
  (next, params) => {
    const { event, type, size = "md", year } = params;

    if (year) {
      setSelectedYear(year);  // ✨ Atualiza o contexto
    }
    // ... resto da lógica
  },
  [setSelectedYear]
);
```

**Responsabilidade:** Atualizar o YearContext quando um ano é navegado.

---

### 5. **SolOrbitScreen - Usar Ano do Contexto**

📄 `app/cosmos/screens/SolOrbitScreen.tsx` (MODIFICADO)

```typescript
const SolOrbitScreen: React.FC<ScreenProps> = () => {
  const { selectedYear } = useYear(); // ✨ Obter ano do contexto

  const quarterlyStorageKey = buildQuarterlyStorageKey(selectedYear, selectedMoonPhase);
  const annualStorageKey = buildAnnualStorageKey(selectedYear);

  const handleQuarterlyInsightSubmit = async (insight: string) => {
    await saveQuarterlyInsight(selectedMoonPhase, insight, undefined, selectedYear);
  };

  const handleAnnualInsightSubmit = async (insight: string) => {
    await saveAnnualInsight(insight, selectedYear);
  };
};
```

**Mudanças:**

- Uso do `useYear()` para obter `selectedYear`
- Passar `selectedYear` para as funções de salvamento
- Atualizar título e descrição do modal para refletir o ano selecionado

---

### 6. **Hooks Atualizados - Aceitar Ano como Parâmetro**

#### useAnnualInsights

📄 `hooks/useAnnualInsights.ts` (MODIFICADO)

```typescript
const saveInsight = useCallback(async (insight: string, year?: number) => {
  const selectedYear = year ?? new Date().getFullYear();
  const response = await fetch('/api/form/annual-insight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ insight, year: selectedYear }),
    credentials: 'include',
  });
  // ...
}, []);
```

#### useQuarterlyInsights

📄 `hooks/useQuarterlyInsights.ts` (MODIFICADO)

```typescript
const saveInsight = useCallback(
  async (moonPhase: string, insight: string, quarterNumber?: number, year?: number) => {
    const selectedYear = year ?? new Date().getFullYear();
    const response = await fetch('/api/form/quarterly-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moonPhase, insight, quarterNumber, year: selectedYear }),
      credentials: 'include',
    });
    // ...
  },
  []
);
```

---

### 7. **Endpoints da API - Receber e Usar Ano**

#### Annual Insight

📄 `app/api/form/annual-insight/route.ts` (MODIFICADO)

```typescript
const { insight, year } = body;
const selectedYear = year ?? new Date().getFullYear();

// Salvar no Neon com o ano selecionado
await saveAnnualInsight(userId, insight, selectedYear);

// Salvar no Sheets
const data = {
  ano: selectedYear.toString(),
  // ...
};
```

#### Quarterly Insight

📄 `app/api/form/quarterly-insight/route.ts` (MODIFICADO)

```typescript
const { moonPhase, insight, quarterNumber, year } = body;
const selectedYear = year ?? new Date().getFullYear();

// Salvar no Neon
await saveQuarterlyInsight(userId, moonPhase, quarter, insight, selectedYear);

// Salvar no Google Sheets
const sourceId = `${selectedYear}-q${quarter}-${moonPhase}`;
const metadata = {
  quarter,
  quarterLabel: quarterMap[quarter],
  year: selectedYear,
};
```

---

## Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│ GalaxySunsScreen: Clicar em um Sol                                  │
│ (ex: Sol de 2024)                                                    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ onClick -> navigateWithFocus("solOrbit", {year: 2024})
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CosmosPageContent: Receber year                                     │
│ -> setSelectedYear(2024)                                             │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ YearContext.selectedYear = 2024
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│ SolOrbitScreen: Usar o ano do contexto                              │
│ const { selectedYear } = useYear()  // 2024                         │
│ Título: "2024"                                                       │
│ Modal título: "Insight Anual de 2024"                               │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Usuário escreve insight e clica "Concluir"
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│ saveAnnualInsight(insight, 2024)                                    │
│ POST /api/form/annual-insight                                        │
│ body: { insight, year: 2024 }                                       │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ API recebe o ano
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│ /api/form/annual-insight/route.ts                                   │
│ const selectedYear = year ?? new Date().getFullYear()               │
│ await saveAnnualInsight(userId, insight, selectedYear)              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ INSERT INTO annual_insights
                           │ WHERE user_id = X AND year = 2024
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Banco de Dados: Neon                                                │
│ ✅ Insight salvo para 2024 (não mais 2025)                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Benefícios da Solução

### ✅ **Multi-Ano Suportado**

- Usuários podem registrar insights para 2023, 2024, 2025, 2026, etc.
- Cada ano tem seu próprio conjunto de insights anuais e trimestrais

### ✅ **Mantém Compatibilidade**

- Fallback para ano atual se nenhum ano for especificado
- Funciona com navegação normal (sem focus)
- Continua salvando em Google Sheets para compatibilidade

### ✅ **Escalável**

- Estrutura pronta para adicionar filtros por ano
- Fácil de ler insights de anos anteriores
- Suporta visualização de progressão ao longo dos anos

### ✅ **Sem Breaking Changes**

- Parâmetros `year` são opcionais
- Código existente continua funcionando

---

## Próximos Passos (Recomendações)

### 1. **Leitura de Insights por Ano**

Criar endpoints para ler insights de um ano específico:

```typescript
// GET /api/insights/annual/:year
// GET /api/insights/quarterly/:year
// Permitir filtrar e visualizar insights históricos
```

### 2. **Visualização Temporal**

Adicionar interface para:

- Timeline visual dos insights por ano
- Comparação entre anos
- Análise de progresso

### 3. **Validação no Backend**

```typescript
if (year < 2000 || year > 2999) {
  return NextResponse.json({ error: 'Ano inválido' }, { status: 400 });
}
```

### 4. **Query Otimizada**

```typescript
// Índices existentes já cobrem year
// Nada a fazer - schema já está otimizado
```

---

## Resumo das Mudanças

| Arquivo                      | Tipo | Alterações                                   |
| ---------------------------- | ---- | -------------------------------------------- |
| `YearContext.tsx`            | NOVO | Context + Hook para gerenciar ano global     |
| `types.ts`                   | MOD  | Adicionado `year?` aos parâmetros            |
| `GalaxySunsScreen.tsx`       | MOD  | Passa `year` ao navegar                      |
| `page.tsx`                   | MOD  | Envolve com YearProvider e atualiza contexto |
| `SolOrbitScreen.tsx`         | MOD  | Usa `selectedYear` do contexto               |
| `useAnnualInsights.ts`       | MOD  | Aceita parâmetro `year`                      |
| `useQuarterlyInsights.ts`    | MOD  | Aceita parâmetro `year`                      |
| `annual-insight/route.ts`    | MOD  | Recebe e usa `year` do body                  |
| `quarterly-insight/route.ts` | MOD  | Recebe e usa `year` do body                  |

**Total:** 9 arquivos modificados | 0 breaking changes | 100% retrocompatível
