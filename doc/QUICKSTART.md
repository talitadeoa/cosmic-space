# 🚀 Quick Start - Autenticação & Coleta de Dados

## 5 Minutos para Começar

### 1️⃣ Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env.local
cp .env.local.example .env.local
```

Editar `.env.local`:
```env
AUTH_PASSWORD=sua_senha_123
GOOGLE_SHEET_ID=seu_id_da_planilha
GOOGLE_SHEETS_API_KEY=sua_chave_api
```

### 2️⃣ Obter Google Sheets Credentials

**Onde encontrar GOOGLE_SHEET_ID:**
- Abra sua planilha no [Google Sheets](https://sheets.google.com/)
- Copie o ID da URL: `https://docs.google.com/spreadsheets/d/**{ID_AQUI}**/edit`

**Onde encontrar GOOGLE_SHEETS_API_KEY:**
1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative "Google Sheets API"
4. Vá em "Credentials" > "Create Credentials" > "API Key"
5. Copie a chave

### 3️⃣ Preparar Planilha Google Sheets

1. Acesse sua planilha
2. Crie uma aba chamada **"Dados"**
3. Adicione headers na primeira linha:

```
| Timestamp | Nome | Email | Mensagem | Data Criação | Status |
```

### 4️⃣ Rodar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000/universo`

### 5️⃣ Testar

1. Digite a senha que configurou em `AUTH_PASSWORD`
2. Preencha e envie o formulário
3. Verifique se os dados aparecem na planilha Google Sheets 🎉

---

## 📁 Arquivos Criados

```
lib/
  ├── auth.ts              # Sistema de autenticação
  └── sheets.ts            # Integração Google Sheets

app/api/
  ├── auth/
  │   ├── login/route.ts   # POST /api/auth/login
  │   ├── logout/route.ts  # POST /api/auth/logout
  │   └── verify/route.ts  # GET /api/auth/verify
  └── form/
      └── submit/route.ts  # POST /api/form/submit

components/
  ├── AuthGate.tsx         # Componente de proteção
  └── DataCollectionForm.tsx # Formulário de coleta

hooks/
  └── useAuth.ts           # Hook para autenticação

app/universo/page.tsx      # Página protegida (já atualizada)
app/exemplo-protegido/page.tsx # Exemplo de uso
```

---

## 🎯 Próximos Passos

- ✅ Autenticação implementada
- ✅ Formulário de coleta criado
- ✅ Google Sheets integrado
- ⏭️ [Opcional] Implementar JWT para produção
- ⏭️ [Opcional] Adicionar dashboard de visualização
- ⏭️ [Opcional] Configurar backup automático

---

## 🔗 Links Úteis

- [Documentação Auth](/AUTH_SETUP.md)
- [Documentação Completa](/SETUP_AUTENTICACAO.md)
- [Exemplo de Uso](/app/exemplo-protegido/page.tsx)
- [Google Sheets API Docs](https://developers.google.com/sheets)

---

## ❓ Dúvidas Frequentes

**P: Como mudo a senha?**  
R: Edite `AUTH_PASSWORD` em `.env.local` e reinicie o servidor.

**P: Posso usar autenticação em outras páginas?**  
R: Sim! Use `<AuthGate>` em volta de qualquer página.

**P: Os dados são realmente salvos no Sheets?**  
R: Sim, via API do Google Sheets. Verifique as credenciais se não aparecer.

**P: Como faço logout?**  
R: Use `useAuth()` e chame `logout()`, ou simplesmente use o botão Sair.

---

**Última atualização**: 1 de dezembro de 2025
