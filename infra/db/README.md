# 🗄️ Scripts SQL - Criação de Tabelas

Execute estes scripts **na ordem** no Neon SQL Editor.

## 📋 Ordem de Execução

### ✅ 1. Tabelas Base (EXECUTE PRIMEIRO)

**Arquivo:** `01-base-tables.sql`

- `auth_tokens` - Tokens de autenticação
- `users` - Usuários do sistema
- `form_entries` - Formulários genéricos
- `insights` - Insights unificados (mensal, trimestral, anual)

**IMPORTANTE:** Execute este primeiro, pois as outras tabelas dependem da tabela `users`.

---

### ✅ 2. Fases Lunares

**Arquivo:** `02-lunar-phases.sql`

- `lunar_phases` - Registros de fases lunares por usuário

---

### ✅ 3. Ilhas

**Arquivo:** `03-islands.sql`

- `islands` - Sistema de ilhas/projetos

---

### ✅ 4. Lunações

**Arquivo:** `04-lunations.sql`

- `lunations` - Calendário lunar completo (global)

---

### ✅ 5. Entradas de Fases

**Arquivo:** `05-phase-inputs.sql`

- `phase_inputs` - Entradas do usuário por fase lunar

---

## 🚀 Como Executar no Neon Console

1. **Acesse:** https://console.neon.tech/
2. **Vá em:** SQL Editor (menu lateral)
3. **Para cada arquivo:**
   - Abra o arquivo aqui no VS Code
   - Copie todo o conteúdo (Ctrl+A, Ctrl+C)
   - Cole no SQL Editor do Neon
   - Clique em **Run**
4. **Verifique:** Vá em **Tables** para ver todas as tabelas criadas

---

## ✅ Checklist de Criação

- [ ] `01-base-tables.sql` ✓ **EXECUTE PRIMEIRO**
- [ ] `02-lunar-phases.sql`
- [ ] `03-islands.sql`
- [ ] `04-lunations.sql`
- [ ] `05-phase-inputs.sql`

---

## 📊 Resultado Final

Você deve ter **8 tabelas** criadas:

1. `auth_tokens` - Tokens de sessão
2. `users` - Usuários
3. `form_entries` - Formulários
4. `insights` - Insights unificados ✓ (consolidada: monthly + quarterly + annual)
5. `lunar_phases` - Fases lunares por usuário
6. `islands` - Ilhas/projetos
7. `lunations` - Calendário lunar global
8. `phase_inputs` - Entradas por fase

---

## 🗑️ Arquivos Removidos (Consolidados)

- ~~02-monthly-insights.sql~~ → consolidado em `insights`
- ~~03-quarterly-insights.sql~~ → consolidado em `insights`
- ~~04-annual-insights.sql~~ → consolidado em `insights`
- ~~schema.sql~~ → duplicado, removido
