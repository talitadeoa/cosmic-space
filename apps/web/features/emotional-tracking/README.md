# Emotional Tracking Feature

Rastreamento emocional integrado com tarefas e ciclos lunares.

## Responsabilidades

Permite ao usuário:
- Registrar emoções ao longo do tempo
- Correlacionar com fases lunares
- Correlacionar com tarefas completadas
- Visualizar padrões emocionais

## Dependências

- `@/domains/todo` - Tarefas
- `@/domains/lunar-cycle` - Ciclos lunares
- `@/domains/insights` - Análises
- `@/shared/storage` - Persistência

## Estrutura

```
features/emotional-tracking/
├── components/        # UI de rastreamento
├── hooks/             # useEmotionalState, useEmotionalAnalysis
├── services/          # Análise de padrões
├── types/             # EmotionalEntry, Mood
├── constants.ts
├── index.ts
└── README.md
```

## Roadmap

- [ ] Consolidar componentes
- [ ] Consolidar hooks
- [ ] Implementar análise de padrões
- [ ] Criar types
- [ ] Criar index.ts barrel export
