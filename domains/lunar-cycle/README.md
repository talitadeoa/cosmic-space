# Lunar Cycle Domain

Gerencia ciclos lunares, fases lunares e lunações.

## Estrutura

- `components/` - LunarCalendar, MoonPhasesRail, MoonPhaseDisplay
- `hooks/` - useLunarCycle, useLunations, useCurrentWeekPhase
- `services/` - Cálculos lunares, API de lunações
- `types/` - MoonPhase, LunationData
- `constants.ts` - MOON_PHASES, LABELS, EMOJIS

## Responsabilidades

- Cálculos de fases lunares
- Fetch de dados de lunações
- Calendário lunar
- Timeline de eventos lunares

## Dependências

- `@/shared/api` - HTTP requests
- `@/shared/utils` - Formatação

## Roadmap

- [ ] Consolidar lib/lunar-cycle-utils.ts
- [ ] Consolidar lib/lunation-utils.ts
- [ ] Consolidar lib/moon-calculations.ts
- [ ] Mover componentes
- [ ] Criar index.ts barrel export
