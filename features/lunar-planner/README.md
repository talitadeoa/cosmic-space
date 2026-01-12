# Lunar Planner Feature

Planejador que combina astrologia + ciclos lunares + tarefas.

## Responsabilidades

Ajuda o usuário a planejar tarefas baseado em:
- Fases lunares atuais
- Signos zodiacais
- Insights temporais
- Histórico de tarefas

## Dependências

- `@/domains/astro` - Dados astrológicos
- `@/domains/lunar-cycle` - Ciclos lunares
- `@/domains/todo` - Tarefas
- `@/domains/insights` - Análises
- `@/shared/ui` - Componentes genéricos

## Estrutura

```
features/lunar-planner/
├── components/        # UI do planejador
├── hooks/             # useLunarPlanner, usePhaseRecommendations
├── services/          # Lógica de recomendação
├── types/             # PlannerState, Recommendation
├── constants.ts
├── index.ts
└── README.md
```

## Roadmap

- [ ] Consolidar componentes
- [ ] Criar hooks
- [ ] Implementar engine de recomendação
- [ ] Criar types
- [ ] Criar index.ts barrel export
