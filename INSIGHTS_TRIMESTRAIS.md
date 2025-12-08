# Insights Trimestrais - Guia de Implementação

## 📋 Descrição

Implementação de um sistema de captura de insights trimestrais ao clicar em cada fase da Lua no `SolOrbitScreen`. Cada lua representa um trimestre do ano:

- **Lua Nova** (topo): 1º Trimestre (Jan - Mar)
- **Lua Crescente** (direita): 2º Trimestre (Abr - Jun)
- **Lua Cheia** (topo): 3º Trimestre (Jul - Set)
- **Lua Minguante** (esquerda): 4º Trimestre (Out - Dez)

## 🎯 Fluxo de Uso

1. Usuário clica em uma das 4 luas no `SolOrbitScreen`
2. Modal se abre com as informações da fase e trimestre
3. Usuário digita seu insight trimestral
4. Ao clicar "Salvar Insight", os dados são enviados para a API
5. Dados são salvos no Google Sheets (mesmo sistema do resto da app)
6. Modal se fecha automaticamente após sucesso

## 🔧 Componentes Criados

### 1. **QuarterlyInsightModal** (`components/QuarterlyInsightModal.tsx`)
Modal animado que captura o insight do usuário:
- Exibe a lua e trimestre selecionados
- Textarea para digitar o insight
- Validação de campo obrigatório
- Estados de loading e erro
- Design responsivo e temático

### 2. **useQuarterlyInsights** (`hooks/useQuarterlyInsights.ts`)
Hook React que gerencia o estado e lógica:
- Mantém lista de insights salvos
- Faz chamada para a API
- Gerencia estados de loading e erro
- Retorna função `saveInsight` para submissão

### 3. **API Route** (`app/api/form/quarterly-insight/route.ts`)
Endpoint POST que:
- Valida autenticação do usuário
- Valida dados de entrada
- Mapeia fases para strings legíveis
- Salva no Google Sheets via `appendToSheet`

### 4. **SolOrbitScreen** (atualizado)
Atualizações:
- Estado `isModalOpen` e `selectedMoonPhase`
- Função `handleMoonClick` para abrir modal
- Função `handleInsightSubmit` para salvar insights
- Cliques nas luas agora abrem o modal em vez de navegar

## 📊 Estrutura de Dados

Os insights são salvos no Google Sheets com a estrutura:
```
{
  timestamp: "2024-12-07T10:30:00.000Z",
  fase: "Lua Nova (Jan-Mar)", // ou outro trimestre
  insight: "Texto do insight do usuário...",
  tipo: "insight_trimestral"
}
```

## 🔐 Autenticação

O sistema valida o token de autenticação:
- Token lido do cookie `auth_token`
- Validado com `validateToken()` da lib/auth
- Retorna erro 401 se não autenticado

## 🎨 Design

- Modal com fundo escuro e bordas sky/cyan
- Animações com Framer Motion
- Estados visuais para loading e erro
- Mensagens de feedback do usuário
- Design responsivo com Tailwind

## 🚀 Como Usar

### Integração Já Feita
Tudo está pronto para funcionar! Basta:

1. Acessar o `SolOrbitScreen`
2. Clicar em uma das luas
3. Escrever seu insight
4. Clicar "Salvar Insight"

### Customizações Possíveis

Se precisar mudar os trimestres, edite o objeto `moonPhaseInfo` em `QuarterlyInsightModal.tsx`:

```tsx
const moonPhaseInfo: Record<string, { name: string; quarter: string; months: string }> = {
  luaNova: { name: 'Lua Nova', quarter: '1º Trimestre', months: 'Jan - Mar' },
  // ... customize aqui
};
```

## 📦 Dependências

- `react` (hooks)
- `framer-motion` (animações do modal)
- `next` (API routes)

Todas já estão no projeto!

## ✅ Checklist de Verificação

- [x] Modal abre ao clicar na lua
- [x] Modal mostra informações corretas do trimestre
- [x] Validação de campo obrigatório
- [x] Chamada para API funciona
- [x] Dados salvos no Google Sheets
- [x] Modal fecha após sucesso
- [x] Mensagens de erro exibem corretamente
- [x] Estados de loading funcionam
- [x] Autenticação validada
- [x] Design responsivo
