# Plano de Modularização — Tipos e Hooks

Resumo
- Objetivo: mover tipos canônicos e hooks de domínio para pacotes independentes em `packages/` (
  ex.: `@flua/shared-types`, `@flua/hooks-planet`) com migração incremental e compatibilidade retroativa.

Escopo
- Migrar tipos essenciais (ex.: `planetState`, `IslandId`) e um hook exemplo (`usePlanetState`) como prova de conceito.
- Criar scaffolds de pacote, configurar build (TS project refs ou paths), adicionar re-exports de compatibilidade e validar build/CI.

Não está no escopo inicial
- Reescrever toda a base de código em módulos — faremos migrações incrementais após validação do POC.

Fases e passos (alto nível)

1) Preparação (audit & design)
  - Inventariar exports públicos de tipos e hooks e mapear consumidores.
  - Definir boundaries e API pública de cada pacote (nomes, exports essenciais).
  - Artefato: `PACKAGES_BOUNDARIES.md` (curto).

2) Scaffold de pacotes (POC)
  - Criar diretório `packages/shared-types` e `packages/hooks-planet`.
  - Adicionar `package.json`, `tsconfig.json` (modo `composite`/projectRefs) e `src/index.ts` exportando apenas a API pública.
  - Artefato: pacotes compiláveis com `pnpm -w turbo run build`.

3) Migrar prova de conceito
  - Mover `planetState` para `@flua/shared-types` e `usePlanetState` para `@flua/hooks-planet`.
  - Adicionar re-export de compatibilidade nos locais antigos (`types/planetState.ts` e `client/hooks/…`) como shim `export * from '@flua/shared-types'` e marcar como deprecated.
  - Rodar `npx tsc --build` e `pnpm -w turbo run build` para validar.

4) Automação de imports
  - Criar um codemod com `ts-morph` ou `jscodeshift` para atualizar imports para os novos pacotes.
  - Executar em modo dry-run, revisar diffs e aplicar progressivamente.

5) CI e validação
  - Adicionar tasks no `turbo.json` para build/lint/test por pacote.
  - Adicionar job CI que execute `pnpm -w turbo run build` + `npx tsc --build` + testes.

6) Remoção de shims
  - Após 1–2 releases e validação, remover re-exports antigos e marcar breaking change.

Comandos úteis (exemplos)

Scaffold minimal
```bash
mkdir -p packages/shared-types packages/hooks-planet
# exemplo package.json para shared-types
cat > packages/shared-types/package.json <<EOF
{
  "name": "@flua/shared-types",
  "version": "0.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "private": true,
  "scripts": { "build": "tsc -b", "lint": "eslint src --ext .ts,.tsx" }
}
EOF

# instalar dependências no workspace
pnpm -w install

# build monorepo
pnpm -w turbo run build
```

Estrutura de exemplo de `packages/shared-types`
```
packages/shared-types/
  package.json
  tsconfig.json
  src/
    index.ts        # exports públicos: IslandId, PlanetState, etc.
    planetState.ts  # implementação/definições
```

Tsconfig e build
- Recomendo `composite`/project references: cada package com `tsconfig.json` apontando para `src` e um `tsconfig.base.json` na raiz com paths compartilhados.
- Alternativa menor: usar `paths` no `tsconfig.base.json` referenciando `packages/*/src` durante a fase de POC.

Codemod (diretrizes rápidas)
- Usar `ts-morph` para localizar `import { PlanetState } from '@/types/planetState'` e substituir por `import { PlanetState } from '@flua/shared-types'`.
- Fazer dry-run, salvar patch e revisar antes de aplicar.

Validação e critérios de aceitação
- `pnpm -w turbo run build` e `npx tsc --build` passam sem erros.
- Apps principais (`apps/web`, `apps/api`) compilam e testes unitários/smoke passam.
- Re-exports de compatibilidade existem e mostram warn/log de deprecação.

Rollback / Safety
- Todas as alterações são feitas em commits separados com PR; usar branch por POC.
- Mantemos shims por 1–2 releases para evitar quebra.

Estimativa (POC)
- Audit + design: 1 dia
- Scaffold + POC migration: 0.5–1 dia
- Codemod + validação: 0.5–1 dia
- CI updates + cleanup plan: 0.5 dia

Próximos passos sugeridos
1. Confirmar que quer que eu **scaffolde** os pacotes de exemplo e migre `planetState` + `usePlanetState` (opção A). Eu implemento e valido o build.
2. Ou pedir apenas os patches PR-ready para revisão (opção B).

---
Arquivo gerado automaticamente para guiar a migração incremental. Peça para eu seguir com A ou B.
