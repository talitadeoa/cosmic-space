# Guia de Integração da Rota Planeta

## 🚀 Acessando a Rota

A rota planeta está disponível em:
```
http://localhost:3000/planeta
```

## 📋 Estrutura de Pastas

```
app/
├── planeta/                    # NOVA ROTA
│   ├── layout.tsx             # Layout com metadata
│   └── page.tsx               # Página principal
│
└── cosmos/
    ├── components/            # Componentes reutilizáveis
    ├── context/              # Provedores de contexto
    ├── hooks/                # Hooks customizados
    ├── screens/
    │   ├── planet.tsx        # NOVA TELA (cópia do SidePlanetCardScreen)
    │   └── ...
    ├── types/                # Definições de tipos
    └── utils/                # Utilitários
```

## 🔌 Como Navegar para a Página Planeta

### Opção 1: Link Direto
```tsx
import Link from 'next/link';

export default function Navigation() {
  return <Link href="/planeta">Ir para Planeta</Link>;
}
```

### Opção 2: Use Router
```tsx
'use client';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const router = useRouter();
  return (
    <button onClick={() => router.push('/planeta')}>
      Ir para Planeta
    </button>
  );
}
```

### Opção 3: Dentro da Navegação Existente
Se você tem um menu ou navegação, adicione:
```tsx
{
  label: 'Planeta',
  href: '/planeta',
  icon: '🪐'
}
```

## 🎨 Customizações Possíveis

### 1. Adicionar Navegação de Volta
Em `/app/planeta/page.tsx`:
```tsx
'use client';

import Link from 'next/link';

const PlanetaPage: React.FC = () => {
  return (
    <div>
      <Link href="/" className="text-indigo-400 hover:text-indigo-300">
        ← Voltar ao início
      </Link>
      {/* resto da página */}
    </div>
  );
};
```

### 2. Adicionar Header Custom
Em `/app/planeta/layout.tsx`:
```tsx
export default function PlanetaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-950">
      <header className="border-b border-indigo-500/20 p-4">
        <h1 className="text-2xl font-bold text-white">🪐 Planeta - Organizador Lunar</h1>
      </header>
      {children}
    </div>
  );
}
```

### 3. Adicionar Navegação Modal
Em `/app/planeta/page.tsx`, implementar a função `handleNavigateWithFocus` para navegar entre telas:
```tsx
const handleNavigateWithFocus: ScreenProps['navigateWithFocus'] = (screenId, options) => {
  switch(screenId) {
    case 'planetCardStandalone':
      // Navegar para tela de lua individual
      break;
    case 'planetCardBelowSun':
      // Navegar para tela de sol
      break;
    // ... outros casos
  }
};
```

## 🧪 Testando a Rota

1. **Iniciar o servidor:**
   ```bash
   npm run dev
   ```

2. **Acessar a página:**
   - Abra `http://localhost:3000/planeta`

3. **Testar funcionalidades:**
   - Criar uma nova tarefa
   - Arrastar para uma fase lunar
   - Filtrar tarefas
   - Renomear ilhas

## 📱 Responsividade

A página planeta herda toda a responsividade do componente original:
- **Mobile** (< 640px) - Layout em coluna única
- **Tablet** (640px - 1024px) - Layout adaptado
- **Desktop** (> 1024px) - Layout completo com 3 colunas

## 🔐 Autenticação

Se precisar proteger a rota com autenticação, adicione em `/app/planeta/page.tsx`:
```tsx
import AuthGate from '@/components/AuthGate';

const PlanetaPage: React.FC = () => {
  return (
    <AuthGate>
      {/* conteúdo */}
    </AuthGate>
  );
};
```

## 🎯 Próximos Passos

1. ✅ Rota criada em `/app/planeta`
2. ✅ Tela (screen) criada em `/app/cosmos/screens/planet.tsx`
3. ⏭️ **TODO**: Adicionar navegação para a rota no menu principal
4. ⏭️ **TODO**: Implementar navegação modal entre telas
5. ⏭️ **TODO**: Adicionar testes E2E

## 📚 Documentação Relacionada

- [PLANETA_ROTA_ESTRUTURA.md](./PLANETA_ROTA_ESTRUTURA.md) - Estrutura detalhada por camadas
- [ARQUITETURA.md](./ARQUITETURA.md) - Arquitetura geral do projeto
