# 📚 Guia de Uso - Insights Trimestrais

## 🎯 Visão Geral

A funcionalidade de **Insights Trimestrais** permite que o usuário clique em cada fase da Lua e adicione sua reflexão para aquele trimestre do ano.

## 🌙 As Quatro Luas

```
                    🌕 Lua Cheia
                    (Jul - Set)
                         ↑
🌗 Lua Minguante ← [ ☀️ SOL ] → 🌓 Lua Crescente
(Out - Dez)      (Centro)       (Abr - Jun)
                         ↓
                    🌑 Lua Nova
                    (Jan - Mar)
```

## 💬 Modal de Input

Quando você clica em uma lua, um modal aparece:

```
╔═══════════════════════════════════════╗
║  🌕 Lua Cheia                         ║
║  3º Trimestre                         │ ← Título dinâmico
║  Jul - Set                            │ ← Período dinâmico
│                                       │
║  Seu Insight Trimestral               │
║  ┌─────────────────────────────────┐  │
║  │ Escreva sua reflexão aqui...     │  │ ← Textarea
║  │                                 │  │
║  │                                 │  │
║  └─────────────────────────────────┘  │
│                                       │
║  [ Cancelar ]      [ Salvar Insight ] │ ← Botões
╚═══════════════════════════════════════╝
```

## 📋 Fluxo Completo

### 1️⃣ Usuário Clica na Lua

```tsx
<CelestialObject
  type="luaCheia"
  onClick={() => handleMoonClick('luaCheia')}
/>
```

### 2️⃣ Modal Abre

```tsx
<QuarterlyInsightModal
  isOpen={isModalOpen}
  moonPhase={selectedMoonPhase}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleInsightSubmit}
/>
```

### 3️⃣ Usuário Escreve e Salva

```
Input → Validação → API Call → Google Sheets → ✅ Sucesso
```

### 4️⃣ Dados no Google Sheets

```
timestamp              fase                 insight                tipo
2024-12-07T10:30:00   Lua Nova (Jan-Mar)  "Aprendi muito..."    insight_trimestral
2024-12-07T11:45:00   Lua Cheia (Jul-Set) "Grande conclusão..." insight_trimestral
```

## 🔄 Fluxo Técnico

```
Frontend (React)
├─ SolOrbitScreen.tsx
│  ├─ Estado: isModalOpen, selectedMoonPhase
│  ├─ handleMoonClick() → abre modal
│  ├─ handleInsightSubmit() → chama hook
│  └─ useQuarterlyInsights()
│
├─ QuarterlyInsightModal.tsx
│  ├─ Renderiza formulário
│  ├─ Valida campo
│  └─ Chama onSubmit()
│
├─ useQuarterlyInsights.ts
│  ├─ saveInsight()
│  └─ POST /api/form/quarterly-insight
│
Backend (Next.js)
└─ app/api/form/quarterly-insight/route.ts
   ├─ Valida token
   ├─ Valida dados
   ├─ Mapeia fase
   └─ Salva no Google Sheets via appendToSheet()
```

## 🛠️ Códigos de Exemplo

### Usar em Outro Lugar

Se quiser reutilizar o hook em outro componente:

```tsx
import { useQuarterlyInsights } from '@/hooks/useQuarterlyInsights';

export function MeuComponente() {
  const { saveInsight, isLoading, error } = useQuarterlyInsights();

  const handleSave = async () => {
    try {
      await saveInsight('luaNova', 'Meu insight aqui...');
      console.log('Salvo com sucesso!');
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <button onClick={handleSave} disabled={isLoading}>
      {isLoading ? 'Salvando...' : 'Salvar'}
    </button>
  );
}
```

### Customizar Modal

Para mudar cores ou textos:

```tsx
// Em QuarterlyInsightModal.tsx

const moonPhaseInfo = {
  luaNova: {
    name: 'Lua Nova', // customize
    quarter: '1º Trimestre', // customize
    months: 'Jan - Mar' // customize
  },
  // ... outros
};

// Classes Tailwind também são customizáveis
// Procure por className="..." e ajuste conforme necessário
```

## 📱 Responsividade

- ✅ Modal funciona em mobile
- ✅ Textarea cresce conforme conteúdo
- ✅ Botões ajustam para toque
- ✅ Animações suaves em todos os devices

## 🔒 Segurança

- ✅ Token verificado no backend
- ✅ Sem dados sensíveis expostos
- ✅ Validação em ambos os lados (frontend + backend)
- ✅ Tipo-seguro com TypeScript

## ⚡ Performance

- ✅ Modal é renderizado sob demanda
- ✅ Sem re-renders desnecessários
- ✅ Animações otimizadas com Framer Motion
- ✅ API call é eficiente

## 🐛 Troubleshooting

### "Modal não abre"
- Verifique se o `SolOrbitScreen` está renderizando
- Cheque o console para erros

### "Insight não salva"
- Verifique se está autenticado (cookie `auth_token`)
- Cheque erros na aba Network do DevTools
- Verifique se Google Sheets está conectado

### "Erro de validação"
- Verifique se preencheu o campo de insight
- Campo não pode ficar vazio

## 📊 Próximas Ideias

Você pode:
- ✨ Adicionar emoji picker para insights
- 📸 Adicionar imagem/foto
- 🏷️ Adicionar tags ou categorias
- 📅 Mostrar histórico de insights anteriores
- 📈 Criar gráfico de insights por trimestre

---

**Tudo pronto para usar!** 🚀
