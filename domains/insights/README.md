# Insights Domain

Gerencia insights (mensal, trimestral, anual, lunar).

## Estrutura

- `components/` - InsightCard, InsightDisplay, TimelineCard
- `hooks/` - useMonthlyInsights, useQuarterlyInsights, useAnnualInsights, useGenericInsights
- `services/` - Geração de insights, cálculos
- `types/` - GenericInsight, MonthlyInsight, QuarterlyInsight, etc
- `constants.ts` - INSIGHT_TYPES

## Responsabilidades

- Geração de insights temporais
- Análise de dados do usuário
- Formatação e apresentação
- Cache de insights

## Dependências

- `@/domains/todo` - Dados de tarefas
- `@/domains/lunar-cycle` - Ciclo lunar
- `@/shared/api` - HTTP requests

## Roadmap

- [ ] Consolidar hooks/useMonthlyInsights.ts
- [ ] Consolidar hooks/useQuarterlyInsights.ts
- [ ] Consolidar hooks/useAnnualInsights.ts
- [ ] Consolidar hooks/useGenericInsights.ts
- [ ] Mover componentes
- [ ] Criar index.ts barrel export
