# Domínios

Pastas para organização por domínio de negócio.

Cada domínio contém sua própria estrutura:
- `components/` - UI específica do domínio
- `hooks/` - Lógica com estado do domínio
- `services/` - Lógica de negócio (API, DB, cálculos)
- `types/` - Tipos específicos do domínio
- `constants.ts` - Constantes do domínio
- `index.ts` - Barrel export
- `README.md` - Documentação

## Domínios Atuais

- **auth** - Autenticação e sessão
- **astro** - Astrologia e signos
- **lunar-cycle** - Ciclos lunares e lunações
- **todo** - Tarefas e ilhas
- **insights** - Insights (mensal, trimestral, anual)
- **community** - Comunidade e posts

## Princípios

1. Ownership claro por domínio
2. Sem importações cruzadas entre domínios
3. Sempre importar via barrel export (`index.ts`)
4. Dependências unidirecionais: `domains/ → shared/`
