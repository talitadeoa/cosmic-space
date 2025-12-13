# Análise de Merge: `back` ← `uxui`

## 📋 Status das Branches

- **Branch atual**: `back` (HEAD → af32854)
- **Branch para integrar**: `uxui` (f2a92da)
- **Ponto de divergência comum**: `f2a92da` (Merge uxui de 12/dez/2025 23:12)
- **Commits adicionados em back**: 
  - 44981cf: db integration email storage
  - fdb769e: Merge pull request #5
  - af32854: Merge branch back (sync com origin)

🔑 **CENÁRIO REAL**: `back` é um descendente direto de `uxui`. 
- `uxui` tem o estado "limpo" (sem DB)
- `back` foi criada FROM `uxui` e ADICIONOU database integration

**Diagnóstico**: Git retorna "Already up to date" porque `back` já contém todo o histórico de `uxui`. 
O problema é que `back` depois foi "modificada" para reintroduzir database e auth, enquanto `uxui` em `origin` foi revertida para versão sem DB.

---

## 🚨 PROBLEMAS CRÍTICOS DETECTADOS

### 1. **BREAKING CHANGE: Contrato de Autenticação alterado (CRÍTICO)**

#### Problema:
- **`back` (current)**:
  - POST `/api/auth/login` requer: `{ email, password }`
  - `hooks/useAuth.ts`: `login(email: string, password: string)`
  - Armazena usuário no banco: `INSERT INTO users (email, provider, last_login)`

- **`uxui` (target)**:
  - POST `/api/auth/login` requer: apenas `{ password }`
  - `components/AuthGate.tsx`: `login(password)` - remove campo email
  - `lib/db.ts` foi removido

#### Impacto:
- ❌ Clientes chamando `login(email, password)` quebram
- ❌ Formulários que coletam email precisam ser atualizados
- ❌ Dados de usuários armazenados no banco não serão sincronizados

#### Recomendação:
**Manter `back` como autoridade**, pois tem:
1. Integração com banco de dados
2. Histórico de usuários
3. Chamadas corretas de autenticação

---

### 2. **Remoção de Infraestrutura do Banco (CRÍTICO)**

#### Diferenças:
- **`back`** tem: `lib/db.ts`, `infra/db/schema.sql`, `doc/SETUP_NEON.md`
- **`uxui`** removeu: Esses 3 arquivos
- **`back`** tem: `doc/EMAIL_STORAGE.md` (105 linhas de documentação)

#### Impacto:
- ❌ Se aceitar uxui, perde capacidade de persistência de dados
- ❌ Aplicação volta para armazenamento em memória apenas

#### Recomendação:
**Absolutamente manter `back`** - database é crítico para produção

---

### 3. **Documentação de Setup**

Diferenças:
- `back`: 47 linhas `SETUP_NEON.md` + 105 linhas `EMAIL_STORAGE.md`
- `uxui`: Removeu tudo

Recomendação: Manter back

---

## 📊 Arquivos Afetados (11 arquivos)

| Arquivo | Back | uxui | Ação |
|---------|------|------|------|
| `.env.local.example` | ✅ | ❌ | Manter back |
| `aaa` | ✅ | ❌ | Manter back (arquivo misterioso) |
| `app/api/auth/login/route.ts` | ✅ backend | ❌ sem email | **RESOLVE: Manter back** |
| `app/api/subscribe/route.ts` | 24 linhas | 24 linhas | Revisar mudanças |
| `components/AuthGate.tsx` | ✅ com email | ❌ sem email | **RESOLVE: Manter back** |
| `doc/EMAIL_STORAGE.md` | ✅ 105 linhas | ❌ | Manter back |
| `doc/SETUP_NEON.md` | ✅ 47 linhas | ❌ | Manter back |
| `hooks/useAuth.ts` | ✅ (email, password) | ❌ (apenas password) | **RESOLVE: Manter back** |
| `infra/db/schema.sql` | ✅ | ❌ | Manter back |
| `lib/db.ts` | ✅ | ❌ | Manter back |
| `lib/forms.ts` | ✅ 78 linhas | ❌ | Manter back |

---

## ✅ Recomendação de Merge

### Estratégia: **"Preferir back com cherry-pick seletivo de uxui"**

1. **O QUE MANTER DE BACK (Tudo)**:
   - Toda autenticação com email
   - Schema do banco de dados
   - Documentação setup
   - Hooks customizados

2. **O QUE REVISAR DE UXUI**:
   - Mudanças em `app/api/subscribe/route.ts`
   - Componentes lua-list (que chegaram via merge PR #40)
   - Radio player
   - UI improvements

3. **PASSO A PASSO**:
   ```bash
   # 1. Fazer merge com estratégia "ours" (preferir back)
   git merge uxui -X ours -m "Merge uxui: preferir back em conflitos críticos"
   
   # 2. Revisar app/api/subscribe/route.ts
   # 3. Build & test
   # 4. Push
   ```

---

## 🔍 Próximas Ações

1. ✅ Análise completa: **FEITA**
2. ⏳ Executar merge com estratégia `ours`
3. ⏳ Revisar `app/api/subscribe/route.ts` para mudanças relevantes
4. ⏳ Testar com `npm run build`
5. ⏳ Validar sem erros
6. ⏳ Push para origin

