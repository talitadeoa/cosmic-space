# 📋 Referência Rápida - API & Componentes

## 🔑 Variáveis de Ambiente

```env
# .env.local
AUTH_PASSWORD=sua_senha_super_segura
GOOGLE_SHEET_ID=seu_id_da_planilha
GOOGLE_SHEETS_API_KEY=sua_chave_de_api
```

---

## 🔌 API Endpoints

### POST /api/auth/login
**Fazer login com senha**

Request:
```json
{
  "password": "sua_senha"
}
```

Response (200):
```json
{
  "success": true,
  "token": "hash_do_token",
  "message": "Autenticação bem-sucedida"
}
```

Response (401):
```json
{
  "error": "Senha incorreta"
}
```

---

### GET /api/auth/verify
**Verificar se está autenticado**

Headers:
```
Cookie: auth_token=seu_token
```

Response (200):
```json
{
  "authenticated": true
}
```

Response (401):
```json
{
  "authenticated": false
}
```

---

### POST /api/auth/logout
**Fazer logout e invalidar token**

Request: (sem body necessário)

Response (200):
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

---

### POST /api/form/submit
**Enviar dados para Google Sheets**

Request:
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "message": "Olá, gostei muito!"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Dados salvos com sucesso"
}
```

Response (401):
```json
{
  "error": "Não autenticado"
}
```

Response (400):
```json
{
  "error": "Nome, email e mensagem são obrigatórios"
}
```

---

## 🎨 Componentes

### `<AuthGate>`

Envolve conteúdo que requer autenticação.

```tsx
<AuthGate>
  <MeuConteudo />
</AuthGate>
```

**Props:**
- `children: React.ReactNode` - Conteúdo protegido

**Comportamento:**
- Se não autenticado: mostra tela de login
- Se autenticado: mostra conteúdo
- Enquanto carrega: mostra spinner

---

### `<DataCollectionForm>`

Formulário para capturar e enviar dados.

```tsx
<DataCollectionForm 
  onSuccess={() => alert('Enviado!')} 
/>
```

**Props:**
- `onSuccess?: () => void` - Callback após sucesso

**Campos:**
- Nome (text, obrigatório)
- Email (email, obrigatório)
- Mensagem (textarea, obrigatório)

**Features:**
- Validações de entrada
- Feedback de erro
- Feedback de sucesso
- Botão desabilitado enquanto envia

---

## 🎣 Hooks

### `useAuth()`

Gerencia estado de autenticação.

```tsx
const { 
  isAuthenticated,     // boolean
  loading,             // boolean
  error,               // string | null
  login,               // (password: string) => Promise<boolean>
  logout,              // () => Promise<void>
  verifyAuth           // () => Promise<void>
} = useAuth();
```

**Exemplo completo:**
```tsx
'use client';
import { useAuth } from '@/hooks/useAuth';

export default function Componente() {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Bem-vindo!</p>
          <button onClick={logout}>Sair</button>
        </>
      ) : (
        <p>Não autenticado</p>
      )}
    </div>
  );
}
```

---

## 🏗️ Estrutura de Dados

### Token
```typescript
type Token = string; // 64 caracteres hex (32 bytes)
```

### Dados do Formulário (Google Sheets)
```typescript
{
  Timestamp: "2025-12-01T10:30:00.000Z",
  Nome: "João Silva",
  Email: "joao@exemplo.com",
  Mensagem: "Feedback do usuário",
  "Data Criação": "2025-12-01T10:30:00.000Z",
  Status: "Novo registro"
}
```

---

## 🔄 Fluxos Comuns

### Fluxo: Fazer Login
```tsx
import { useAuth } from '@/hooks/useAuth';

const { login, error, isSubmitting } = useAuth();

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const success = await login(password);
  if (success) {
    // Redirecionado automaticamente
  }
};
```

### Fluxo: Fazer Logout
```tsx
import { useAuth } from '@/hooks/useAuth';

const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // Token invalidado, redirecionado para login
};
```

### Fluxo: Proteger Página
```tsx
'use client';
import AuthGate from '@/components/AuthGate';

export default function MinhaPagina() {
  return (
    <AuthGate>
      <h1>Conteúdo Protegido</h1>
    </AuthGate>
  );
}
```

### Fluxo: Enviar Dados
```tsx
import DataCollectionForm from '@/components/DataCollectionForm';

export default function Pagina() {
  return (
    <DataCollectionForm 
      onSuccess={() => console.log('Salvo!')} 
    />
  );
}
```

---

## 🔐 Estados de Autenticação

```
┌─────────────────────┐
│   NÃO AUTENTICADO   │
│  (loading = false)  │
│  auth_token = null  │
└──────────┬──────────┘
           │ POST /api/auth/login
           ▼
┌─────────────────────┐
│   VERIFICANDO       │
│  (loading = true)   │
└──────────┬──────────┘
           │
       ┌───┴───┐
       ▼       ▼
     ✓ OK    ✗ ERRO
       │       │
       ▼       ▼
  ┌────────┐ ┌────────┐
  │AUTENTICADO│ │ERRO│
  │(isAuth=true)│ │(error msg)
  └────────┘ └────────┘
       │       │ Retry
       ▼       ▼
       └───────┘
```

---

## 🐛 Códigos de Status HTTP

| Status | Significado | Quando |
|--------|-------------|--------|
| 200 | OK | Login, Logout, Envio sucesso |
| 400 | Bad Request | Falta dados obrigatórios |
| 401 | Unauthorized | Senha errada, token inválido |
| 500 | Server Error | Erro ao salvar Google Sheets |

---

## 🎯 Debug

### Ver token no console
```javascript
// No navegador (DevTools)
document.cookie
```

### Simular requisição
```bash
# Teste login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"sua_senha"}'

# Teste verificação (com cookie)
curl http://localhost:3000/api/auth/verify \
  -H "Cookie: auth_token=seu_token"
```

### Verificar logs
```bash
# Terminal rodando npm run dev mostra logs
npm run dev
```

---

## 📊 Google Sheets - Estrutura Esperada

**Aba:** "Dados"

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| A | DateTime | Timestamp ISO |
| B | Text | Nome do usuário |
| C | Email | Email do usuário |
| D | Text | Mensagem/Feedback |
| E | DateTime | Data de criação |
| F | Text | Status do registro |

---

## ⚙️ Configurações

### Cookies (HTTP-only)
```typescript
// Definido automaticamente em /api/auth/login
response.cookies.set('auth_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60, // 24 horas
});
```

### Timeout Padrão
- Duração do token: 24 horas
- Timeout de API: 30 segundos (fetch)

---

## 📞 Comandos Úteis

```bash
# Rodar desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar build produção
npm start

# Lint
npm run lint

# Limpar cache
rm -rf .next
npm run build
```

---

**Última atualização**: 1 de dezembro de 2025
