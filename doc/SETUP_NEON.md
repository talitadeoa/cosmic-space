# 🚀 Configurando Neon (PostgreSQL) no Cosmic Space

Persistência das sessões e formulários usando PostgreSQL no Neon, substituindo o Google Sheets.

## 1) Criar banco no Neon
1. Acesse [Neon](https://console.neon.tech) e crie um projeto.
2. Copie a `connection string` (formato `postgres://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require`).
3. Se quiser, gere uma role só de escrita/leitura para produção.

## 2) Criar tabelas
- No console SQL do Neon, cole o conteúdo de `infra/db/schema.sql` e execute.
- Isso cria:
  - `auth_tokens` — guarda token, payload (JSON) e expiração.
  - `form_entries` — armazena leads, mensagens e insights com payload flexível (JSON).

## 3) Variáveis de ambiente
Crie/copiar `.env.local` a partir de `.env.local.example`:
```env
DATABASE_URL=postgres://user:pass@ep-xxxx.neon.tech/neondb?sslmode=require
AUTH_PASSWORD=defina-uma-senha
AUTH_TOKEN_TTL_SECONDS=86400
NEXT_PUBLIC_BASE_URL=http://localhost:3000
# Opcional para OAuth Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## 4) Rotas que usam o banco
- Auth: `POST /api/auth/login`, `GET /api/auth/verify`, `POST /api/auth/logout`
  - Tokens persistidos em `auth_tokens` com TTL configurável.
- Leads & formulários:
  - `POST /api/subscribe`
  - `POST /api/form/submit`
  - `POST /api/form/annual-insight`
  - `POST /api/form/monthly-insight`
  - `POST /api/form/quarterly-insight`
  - `POST /api/form/lunar-phase`
  - `POST /api/checklist/save`
- Logs: `GET /api/logs/emails` (retorna `form_entries` dos tipos `subscribe` e `contact`, exige auth).

## 5) Teste rápido
1. `npm run dev`
2. Acesse `/universo`, faça login com `AUTH_PASSWORD`.
3. Envie um formulário (ex.: `/api/subscribe` via front).
4. Consulte no Neon ou chame `GET /api/logs/emails` para ver o registro.

Pronto! Todo tráfego sai do Google Sheets e vai para o PostgreSQL gerenciado pelo Neon.
