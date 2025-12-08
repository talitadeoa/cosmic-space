# Guia de Configuração: Autenticação e Google Sheets

## 1. Configuração de Autenticação

A autenticação é simples e baseada em senha. Configure a variável de ambiente:

```bash
AUTH_PASSWORD=sua_senha_segura
```

### API Routes de Autenticação

- **POST /api/auth/login** - Fazer login com senha
- **POST /api/auth/logout** - Fazer logout
- **GET /api/auth/verify** - Verificar se está autenticado

## 2. Integração com Google Sheets

### Preparação no Google Cloud

1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API "Google Sheets API"
4. Crie uma chave de API (ou use Service Account para melhor segurança)
5. Copie o ID da sua planilha do Google Sheets da URL

### Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
AUTH_PASSWORD=sua_senha_segura
GOOGLE_SHEET_ID=seu_id_da_planilha
GOOGLE_SHEETS_API_KEY=sua_chave_de_api
```

### Estrutura da Planilha

Crie uma aba chamada "Dados" com as seguintes colunas:

| Timestamp | Nome | Email | Mensagem | Data Criação | Status |
|-----------|------|-------|----------|--------------|--------|
| ISO String | Text | Email | Text | Datetime | Text |

## 3. Usar em uma Página

### Exemplo com proteção de autenticação:

```tsx
// app/universo/page.tsx
'use client';

import AuthGate from '@/components/AuthGate';
import DataCollectionForm from '@/components/DataCollectionForm';
import { GalaxyInnerView } from '@/components/views/GalaxyInnerView';

export default function UniversoPage() {
  return (
    <AuthGate>
      <main className="space-y-8 p-8">
        <GalaxyInnerView />
        <DataCollectionForm />
      </main>
    </AuthGate>
  );
}
```

## 4. Hooks Disponíveis

### useAuth()

```tsx
const { isAuthenticated, loading, error, login, logout, verifyAuth } = useAuth();
```

- `isAuthenticated: boolean` - Se o usuário está autenticado
- `loading: boolean` - Se está carregando
- `error: string | null` - Erro se houver
- `login(password: string): Promise<boolean>` - Fazer login
- `logout(): Promise<void>` - Fazer logout
- `verifyAuth(): Promise<void>` - Verificar autenticação

## 5. Componentes

### AuthGate

Envolve conteúdo e exige autenticação para acessá-lo.

```tsx
<AuthGate>
  <SeuConteudo />
</AuthGate>
```

### DataCollectionForm

Formulário que captura nome, email e mensagem, enviando para Google Sheets.

```tsx
<DataCollectionForm onSuccess={() => console.log('Enviado!')} />
```

## 6. Segurança em Produção

Para produção, considere:

1. **JWT Tokens** - Usar JWT em vez de tokens simples em memória
2. **Banco de Dados** - Armazenar sessões em DB (Redis, PostgreSQL, etc)
3. **HTTPS** - Certificar que está rodando sobre HTTPS
4. **Rate Limiting** - Adicionar limite de requisições
5. **Service Account** - Use Google Service Account em vez de chave de API pública
6. **Variáveis Seguras** - Use gerenciador de secrets (AWS Secrets Manager, etc)

## 7. Testando Localmente

1. Defina `AUTH_PASSWORD` em `.env.local`
2. Rode `npm run dev`
3. Acesse sua página protegida
4. Você verá um formulário de login pedindo senha
5. Após fazer login, será redirecionado para o conteúdo protegido
