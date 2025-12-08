# 🌌 Sistema de Autenticação e Coleta de Dados - Cosmic Space

## 📋 O que foi criado

Este guia detalha a implementação de um sistema de autenticação por senha e coleta de dados que alimenta uma planilha Google Sheets na aplicação Cosmic Space.

### Componentes Criados

#### 1. **Autenticação** (`lib/auth.ts`)
- Geração e validação de tokens
- Validação de senha
- Sistema simples de tokens em memória

#### 2. **Integração Google Sheets** (`lib/sheets.ts`)
- Função para enviar dados para Google Sheets API
- Suporte para leitura de dados (futuro)

#### 3. **API Routes**
- `POST /api/auth/login` - Fazer login com senha
- `POST /api/auth/logout` - Fazer logout
- `GET /api/auth/verify` - Verificar autenticação
- `POST /api/form/submit` - Enviar dados para Sheets

#### 4. **Hook Custom** (`hooks/useAuth.ts`)
- `useAuth()` - Gerencia estado de autenticação
- Métodos: `login()`, `logout()`, `verifyAuth()`

#### 5. **Componentes React**
- `<AuthGate>` - Envolve conteúdo e exige autenticação
- `<DataCollectionForm>` - Formulário para capturar e enviar dados

## 🚀 Como Configurar

### Passo 1: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Copiar do arquivo .env.local.example
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
AUTH_PASSWORD=sua_senha_super_segura
GOOGLE_SHEET_ID=seu_id_da_planilha
GOOGLE_SHEETS_API_KEY=sua_chave_de_api
```

### Passo 2: Configurar Google Sheets

#### 2.1 Criar Google Cloud Project

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API "Google Sheets API"
   - Vá em "APIs & Services" > "Library"
   - Procure por "Google Sheets API"
   - Clique em "Enable"

#### 2.2 Criar Chave de API

1. Vá em "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "API Key"
3. Copie a chave gerada para `GOOGLE_SHEETS_API_KEY` no `.env.local`

#### 2.3 Preparar Planilha Google Sheets

1. Crie uma nova planilha no [Google Sheets](https://sheets.google.com/)
2. Copie o ID da URL: `https://docs.google.com/spreadsheets/d/{GOOGLE_SHEET_ID}/edit`
3. Adicione em `.env.local` como `GOOGLE_SHEET_ID`
4. Crie uma aba chamada "Dados"
5. Adicione os headers na primeira linha:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Timestamp | Nome | Email | Mensagem | Data Criação | Status |

6. **Importante**: Compartilhe a planilha com permissão de edição para o email da sua API Key (ou deixe pública para API Key pública)

### Passo 3: Testar Localmente

```bash
# Instalar dependências (se necessário)
npm install

# Rodar servidor de desenvolvimento
npm run dev
```

1. Acesse `http://localhost:3000/universo`
2. Uma tela de login solicitará a senha
3. Digite a senha configurada em `AUTH_PASSWORD`
4. Após autenticação, você verá a galáxia e o formulário de coleta

### Passo 4: Usar em Suas Páginas

Para proteger qualquer página com autenticação:

```tsx
// app/sua-pagina/page.tsx
'use client';

import AuthGate from '@/components/AuthGate';
import YourComponent from '@/components/YourComponent';

export default function Page() {
  return (
    <AuthGate>
      <YourComponent />
    </AuthGate>
  );
}
```

Para adicionar formulário de coleta de dados:

```tsx
import DataCollectionForm from '@/components/DataCollectionForm';

export default function Page() {
  return (
    <div>
      <DataCollectionForm 
        onSuccess={() => console.log('Enviado!')} 
      />
    </div>
  );
}
```

## 🔐 Segurança

### Desenvolvimento ✅
A configuração atual é adequada para desenvolvimento e testes.

### Produção ⚠️
Para produção, implemente:

1. **JWT Tokens** - Substitua tokens simples por JWT
   ```typescript
   import jwt from 'jsonwebtoken';
   const token = jwt.sign({ user: 'id' }, process.env.JWT_SECRET!);
   ```

2. **Banco de Dados** - Armazene sessões em:
   - Redis (mais rápido)
   - PostgreSQL/MySQL (mais robusto)
   - MongoDB (flexível)

3. **HTTPS** - Force HTTPS em produção

4. **Rate Limiting** - Previna ataques de força bruta
   ```typescript
   // Use pacotes como rate-limiter-flexible ou express-rate-limit
   ```

5. **Service Account** - Use Google Service Account em vez de API Key pública
   - Crie em "APIs & Services" > "Service Accounts"
   - Exporte JSON e use no backend

6. **Variáveis de Ambiente Seguras**
   - Use AWS Secrets Manager, Vercel Environment Variables, etc.

7. **CORS** - Configure CORS adequadamente

## 📚 API Reference

### useAuth Hook

```typescript
const { 
  isAuthenticated,  // boolean - Se está autenticado
  loading,          // boolean - Se está carregando
  error,            // string | null - Erro se houver
  login,            // (password: string) => Promise<boolean>
  logout,           // () => Promise<void>
  verifyAuth        // () => Promise<void>
} = useAuth();
```

### AuthGate Component

```tsx
<AuthGate>
  {/* Conteúdo que requer autenticação */}
</AuthGate>
```

Props:
- `children: React.ReactNode` - Conteúdo protegido

### DataCollectionForm Component

```tsx
<DataCollectionForm onSuccess={() => {}} />
```

Props:
- `onSuccess?: () => void` - Callback quando formulário é enviado com sucesso

Campos do formulário:
- Nome (obrigatório)
- Email (obrigatório, validado)
- Mensagem (obrigatório, textarea)

## 🐛 Troubleshooting

### "Erro ao buscar dados do Sheets"
- Verifique se `GOOGLE_SHEET_ID` está correto
- Verifique se `GOOGLE_SHEETS_API_KEY` está correto
- Confirme se a API está ativada no Google Cloud Console
- Verifique as permissões da planilha

### "Senha incorreta"
- Verifique se `AUTH_PASSWORD` está configurada em `.env.local`
- Reinicie o servidor após editar `.env.local`

### Dados não aparecem no Sheets
- Confirme se criou uma aba chamada "Dados"
- Verifique os headers da primeira linha
- Confirme as permissões de acesso da planilha

### "CORS error"
- A requisição para Google Sheets é feita do servidor, não deve ter CORS issues
- Verifique se a API está ativada

## 📝 Próximos Passos

1. **Dashboard** - Criar página para visualizar dados coletados
2. **Autenticação Multiusuário** - Permitir diferentes usuários com diferentes papéis
3. **Backup Automático** - Sincronizar dados com banco de dados local
4. **Notificações** - Enviar email quando novo dado chegar
5. **Análise de Dados** - Gráficos e relatórios dos dados coletados

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Consulte os logs do servidor (`npm run dev`)
3. Verifique o console do navegador (F12)
4. Veja a documentação do [Next.js](https://nextjs.org/) e [Google Sheets API](https://developers.google.com/sheets)

---

**Criado em**: 1 de dezembro de 2025  
**Versão**: 1.0.0
