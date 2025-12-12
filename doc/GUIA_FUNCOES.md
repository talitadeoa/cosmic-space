# 📖 Guia de Funções do Projeto Cosmic Space

Resumo rápido das principais funções, rotas e módulos — onde ficam e o que fazem.

---

## 🔐 Autenticação
- `lib/auth.ts`  
  - `createAuthToken(payload)`, `validateToken(token)`, `revokeToken(token)`, `getTokenPayload(token)`  
  - `validatePassword(password)` usa `AUTH_PASSWORD` ou padrão `cosmos2025`.
- Rotas:  
  - `app/api/auth/login` — POST senha → cookie `auth_token` (24h)  
  - `app/api/auth/verify` — GET valida cookie e retorna payload  
  - `app/api/auth/logout` — POST limpa cookie  
  - `app/api/auth/google` e `.../callback` — fluxo OAuth Google (usa `GOOGLE_CLIENT_ID/SECRET`).
- UI/Hooks:  
  - `hooks/useAuth.ts` expõe estado (`isAuthenticated`, `loading`, `error`, `user`) + `login`, `logout`, `verifyAuth`, `googleLogin`.  
  - `components/AuthGate.tsx` protege páginas e mostra tela de senha.

## 🛰️ Integração com Google Sheets
- `lib/sheets.ts`  
  - `appendToSheet(data)` envia linhas para a aba `Dados` usando Service Account (`GOOGLE_SA_EMAIL`, `GOOGLE_SA_KEY`).  
  - `getSheetData(id, apiKey?)` lê a aba `Dados`.  
  - Cache interno de access token (JWT) para reduzir chamadas de autenticação.
- Variáveis úteis: `GOOGLE_SHEET_ID`, `GOOGLE_SHEETS_API_KEY` (leitura pública opcional), `GOOGLE_SA_EMAIL`, `GOOGLE_SA_KEY`.

## 🌗 Calendário Lunar
- Backend local: `app/api/moons/route.ts` gera fases aproximadas (params `start`, `end`, `tz`, limite 550 dias).
- Cliente/API: `lib/api/moonCalendar.ts` → `fetchMoonCalendar({ start, end, tz })` normaliza fases (`normalizeMoonPhase`) e aceita endpoint remoto (`NEXT_PUBLIC_MOON_API_URL` ou `NEXT_PUBLIC_BASE_URL/v1/moons`; fallback `/api/moons`).
- Hook: `hooks/useMoonCalendar.ts`  
  - Estado: `calendar`, `generatedAt`, `isLoading`, `error`.  
  - Funções: `refresh()`.  
  - Cache em `localStorage` por range + `tz`; suporta `autoRefreshMs`.
- Automação: `components/AutoSyncLunar.tsx` usa `lib/astro.ts` para fase/signo atual e envia para `/api/form/lunar-phase` após autenticar.

## 📝 Formulários e Insights
- Rotas (todas exigem `auth_token` válido, exceto `subscribe`):  
  - `app/api/form/submit` — nome/email/mensagem → Sheets.  
  - `app/api/form/lunar-phase` — registra fase do dia (conta checks, gera barra).  
  - `app/api/form/monthly-insight` — `moonPhase`, `monthNumber`, `insight`.  
  - `app/api/form/quarterly-insight` — `moonPhase`, `insight`.  
  - `app/api/form/annual-insight` — `insight` do ano.  
  - `app/api/checklist/save` — salva checklist bruto.  
  - `app/api/subscribe` — captura email público (landing).  
  - `app/api/logs/emails` — lê dados do Sheets (auth obrigatório).
- Hooks para enviar e manter estado local:  
  - `hooks/useMonthlyInsights.ts`, `useQuarterlyInsights.ts`, `useAnnualInsights.ts` → `saveInsight(...)`, `isLoading`, `error`, `insights`.  
  - `hooks/useAutosave.ts` → debounce salvamento (status `idle|typing|saving|saved|error`).
- Componentes de checklist/entrada:  
  - `components/TodoInput.tsx` parseia texto estilo `[ ]`/`[x]`, mostra progresso.  
  - `app/cosmos/utils/todoStorage.ts` carrega to-dos salvos (`localStorage`).

## 🔊 Áudio e Efeitos
- `hooks/useAudioPlayer.ts` — player de rádios: `play`, `pause`, `toggle`, `setVolume`, estado de estação, `isPlaying`, `isLoading`.  
- `hooks/useSfx.ts` — efeitos rápidos (`click`, `transition`) via Web Audio.  
- `components/SfxProvider.tsx` (ver pasta `components/`) integra SFX na UI.

## 🎨 Canvas / Visuals
- Hooks: `useCanvasAnimation`, `useCanvasResize`, `useMouseTracking` (pasta `hooks/`).  
- Componentes: `ZoomCanvas.tsx`, `CanvasErrorBoundary.tsx`, `Sphere.tsx`, `UniverseScene.tsx`, `views/ZoomView.tsx`, etc. Usados nas telas em `app/cosmos/*` e `app/universo`.

## 📄 Páginas principais
- `app/page.tsx` — landing bloqueada por `AuthGate`.  
- `app/universo/page.tsx` — experiência cósmica protegida.  
- `app/cosmos/*` — telas temáticas (planetas, checklists, sol, lua).  
- Exemplo protegido: `app/cosmos/auth/page.tsx`.

## ⚙️ Como testar rapidamente
- Login: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"password":"SUA_SENHA"}' -i`
- Verificar auth: `curl http://localhost:3000/api/auth/verify -H "Cookie: auth_token=TOKEN"`
- Calendário local: `curl "http://localhost:3000/api/moons?start=2025-01-01&end=2025-01-10"`
- Enviar insight mensal: `curl -X POST http://localhost:3000/api/form/monthly-insight -H "Content-Type: application/json" -H "Cookie: auth_token=TOKEN" -d '{"moonPhase":"luaCheia","monthNumber":7,"insight":"Texto"}'`

---

**Dica:** para começar, configure `.env.local` com `AUTH_PASSWORD`, `GOOGLE_SHEET_ID`, `GOOGLE_SA_EMAIL/KEY`, rode `npm run dev` e acesse as páginas protegidas com `AuthGate`.***
