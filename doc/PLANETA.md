# Rota Planeta

## Visao geral

A rota `/planeta` expõe a tela PlanetScreen, com organizacao de tarefas por fases lunares e ilhas.

## Acesso

- URL local: `http://localhost:3000/planeta`

## Estrutura principal

```
app/planeta/
  layout.tsx
  page.tsx

app/cosmos/screens/
  planet.tsx
```

## Camadas (resumo)

1. Rota: `app/planeta/page.tsx` + `app/planeta/layout.tsx`
2. Contexto: `app/cosmos/context/YearContext.tsx`
3. Tela: `app/cosmos/screens/planet.tsx`
4. Componentes: `app/cosmos/components/*`
5. Hooks: `hooks/usePhaseInputs.ts`, `hooks/useFilteredTodos.ts`, `hooks/useIslandNames.ts`
6. Utils: `app/cosmos/utils/*`

## Funcionalidades

- Drag and drop para fases lunares e ilhas
- Criar, editar e deletar tarefas
- Filtros por fase, tipo, status e ilha
- Renomear ilhas
- Persistencia via localStorage
- Responsivo (mobile, tablet, desktop)

## Integracao no menu

```tsx
import Link from 'next/link';

export default function Navigation() {
  return <Link href="/planeta">Ir para Planeta</Link>;
}
```

Ou via router:

```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  return <button onClick={() => router.push('/planeta')}>Ir para Planeta</button>;
}
```

## Testes manuais

1. Abrir `http://localhost:3000/planeta`
2. Criar uma tarefa
3. Arrastar para uma fase lunar e para uma ilha
4. Testar filtros

## Opcional: autenticar a rota

```tsx
import AuthGate from '@/components/AuthGate';

export default function PlanetaPage() {
  return <AuthGate>{/* conteudo */}</AuthGate>;
}
```
