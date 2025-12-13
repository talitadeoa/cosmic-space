# 🗄️ Scripts SQL - Criação de Tabelas

Execute estes scripts **na ordem** no Neon SQL Editor.

## 📋 Ordem de Execução

### ✅ 1. Tabelas Base (EXECUTE PRIMEIRO)
**Arquivo:** `01-base-tables.sql`
- `auth_tokens` - Tokens de autenticação
- `users` - Usuários do sistema
- `form_entries` - Formulários genéricos

**IMPORTANTE:** Execute este primeiro, pois as outras tabelas dependem da tabela `users`.

---

### ✅ 2. Insights Mensais
**Arquivo:** `02-monthly-insights.sql`
- `monthly_insights` - 12 meses x 4 fases lunares

---

### ✅ 3. Insights Trimestrais
**Arquivo:** `04-annual-insights.sql`
- `annual_insights` - 1 insight por ano

---

### ✅ 5. Fases Lunares
**Arquivo:** `05-annual-insights.sql`
- `annual_insights` - 1 insight por ano

---

### ✅ 6. Ilhas
**Arquivo:** `06-islands.sql`
- `islands` - Sistema de ilhas

---

### ✅ 7. Lunações
**Arquivo:** `07-islands.sql`
- `islands` - Sistema de ilhas

---

### ✅ 6. Lunações
**Arquivo:** `06-lunations.sql`
- `lunations` - Calendário lunar completo

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
- [ ] `02-monthly-insights.sql`
- [ ] `03-quarterly-insights.sql`
- [ ] `04-annual-insights.sql`
- [ ] `05-lunar-phases.sql`
- [ ] `06-islands.sql`
- [ ] `07-lunations.sql`

---

## 📊 Resultado Final

Você deve ter **9 tabelas** criadas:
1. auth_tokens
2. users
3. form_entries
4. monthly_insights ✓ (já criada)
5. quarterly_insights
6. annual_insights
7. lunar_phases
8. islands
9. lunations
