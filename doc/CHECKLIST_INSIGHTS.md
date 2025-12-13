# ✅ Checklist de Implementação - Tabelas de Insights

## 🗂️ ETAPA 1: BANCO DE DADOS

### Passo 1: Executar SQL no Neon

- [ ] Abrir Neon Console
- [ ] Navegue para seu projeto e banco de dados
- [ ] Abra o SQL Editor
- [ ] Copie o conteúdo de `infra/db/migration-insights.sql`
- [ ] Cole no SQL Editor
- [ ] Execute (Ctrl+Enter ou cmd+Enter)
- [ ] Verifique se não houve erros

**Comandos para verificar:**
```sql
-- Ver as tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('monthly_insights', 'quarterly_insights', 'annual_insights');

-- Ver as colunas
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'monthly_insights' ORDER BY ordinal_position;
```

---

## 💾 ETAPA 2: CÓDIGO NO BACKEND

### Passo 2: Atualizar `lib/forms.ts`

- [ ] Verifique se as funções `saveMonthlyInsight` estão presentes
- [ ] Verifique se as funções `saveQuarterlyInsight` estão presentes
- [ ] Verifique se as funções `saveAnnualInsight` estão presentes
- [ ] Verifique se existem funções `getMonthlyInsights`, `getMonthlyInsight`
- [ ] Verifique se existem funções `getQuarterlyInsights`, `getQuarterlyInsight`
- [ ] Verifique se existem funções `getAnnualInsight`, `getAnnualInsights`
- [ ] Verifique se existe função `getAllInsights`

**Verificar estrutura:**
```bash
grep -n "export async function" lib/forms.ts | grep -i insight
```

---

## 🔌 ETAPA 3: CRIAR APIs

### Passo 3a: API de Insight Mensal

- [ ] Criar arquivo: `app/api/form/monthly-insight/route.ts`
- [ ] Implementar `POST` handler
- [ ] Validar `moonPhase`, `monthNumber`, `insight`
- [ ] Chamar `saveMonthlyInsight` do `lib/forms`
- [ ] Retornar resultado como JSON
- [ ] Testar com curl ou Postman

**Comando para testar:**
```bash
curl -X POST http://localhost:3000/api/form/monthly-insight \
  -H "Content-Type: application/json" \
  -d '{"moonPhase":"luaNova","monthNumber":1,"insight":"Test"}'
```

### Passo 3b: API de Insight Trimestral

- [ ] Criar arquivo: `app/api/form/quarterly-insight/route.ts`
- [ ] Implementar `POST` handler
- [ ] Validar `moonPhase`, `quarterNumber`, `insight`
- [ ] Chamar `saveQuarterlyInsight` do `lib/forms`
- [ ] Retornar resultado como JSON
- [ ] Testar com curl ou Postman

### Passo 3c: API de Insight Anual

- [ ] Criar arquivo: `app/api/form/annual-insight/route.ts`
- [ ] Implementar `POST` handler
- [ ] Validar `insight`, `year` (opcional)
- [ ] Chamar `saveAnnualInsight` do `lib/forms`
- [ ] Retornar resultado como JSON
- [ ] Testar com curl ou Postman

---

## 🎣 ETAPA 4: ATUALIZAR HOOKS

### Passo 4a: useMonthlyInsights

- [ ] Abrir `hooks/useMonthlyInsights.ts`
- [ ] Verificar se chama `/api/form/monthly-insight`
- [ ] Verificar se passa `moonPhase`, `monthNumber`, `insight`
- [ ] Verificar tratamento de erro
- [ ] Verificar estado de loading

### Passo 4b: useQuarterlyInsights

- [ ] Abrir `hooks/useQuarterlyInsights.ts`
- [ ] Verificar se chama `/api/form/quarterly-insight`
- [ ] Verificar se passa `moonPhase`, `quarterNumber`, `insight`
- [ ] Verificar tratamento de erro
- [ ] Verificar estado de loading

### Passo 4c: useAnnualInsights

- [ ] Abrir `hooks/useAnnualInsights.ts`
- [ ] Verificar se chama `/api/form/annual-insight`
- [ ] Verificar se passa `insight`, opcionalmente `year`
- [ ] Verificar tratamento de erro
- [ ] Verificar estado de loading

---

## 🎨 ETAPA 5: COMPONENTES (Já existem)

### Passo 5a: MonthlyInsightModal

- [ ] Verificar se está em `components/MonthlyInsightModal.tsx`
- [ ] Verificar se usa `useMonthlyInsights`
- [ ] Verificar se passa os parâmetros corretos
- [ ] Testar com clique em uma lua no `LuaListScreen`

### Passo 5b: QuarterlyInsightModal

- [ ] Verificar se está em `components/QuarterlyInsightModal.tsx`
- [ ] Verificar se usa `useQuarterlyInsights`
- [ ] Verificar se passa os parâmetros corretos
- [ ] Testar com clique em uma lua no `SolOrbitScreen`

### Passo 5c: AnnualInsightModal

- [ ] Verificar se está em `components/AnnualInsightModal.tsx`
- [ ] Verificar se usa `useAnnualInsights`
- [ ] Testar com clique no Sol no `SolOrbitScreen`

---

## 🧪 ETAPA 6: TESTES

### Passo 6a: Teste de Banco de Dados

- [ ] Conectar ao banco Neon
- [ ] Verificar se as tabelas existem
- [ ] Fazer um INSERT manual para testar

```sql
-- Testar INSERT mensal
INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
VALUES (1, 'luaNova', 1, 'Test insight')
ON CONFLICT (user_id, moon_phase, month_number) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Verificar resultado
SELECT * FROM monthly_insights WHERE user_id = 1;
```

### Passo 6b: Teste de API

- [ ] Testar POST `/api/form/monthly-insight` com dados válidos
- [ ] Testar POST com dados inválidos (verificar erro)
- [ ] Testar POST sem autenticação (deve retornar 401)
- [ ] Testar POST `/api/form/quarterly-insight`
- [ ] Testar POST `/api/form/annual-insight`

### Passo 6c: Teste do Frontend

- [ ] Abrir navegador em `http://localhost:3000`
- [ ] Navegue até a tela de cosmos
- [ ] Clique em uma lua para abrir o modal mensal
- [ ] Digite um insight e clique "Salvar"
- [ ] Verifique no console se houve sucesso
- [ ] Verifique no banco de dados se foi salvo
- [ ] Teste os outros modais (trimestral e anual)

---

## 📋 ETAPA 7: INTEGRAÇÃO COM TELAS

### Passo 7a: LuaListScreen (Insights Mensais)

- [ ] Verificar se importa `useMonthlyInsights`
- [ ] Verificar se importa `MonthlyInsightModal`
- [ ] Verificar se tem estado para controlar modal
- [ ] Verificar se clique nas luas abre o modal
- [ ] Verificar se `handleInsightSubmit` está implementado

### Passo 7b: SolOrbitScreen (Insights Trimestrais e Anuais)

- [ ] Verificar se importa `useQuarterlyInsights`
- [ ] Verificar se importa `useAnnualInsights`
- [ ] Verificar se importa modais
- [ ] Verificar se clique nas luas abre modal trimestral
- [ ] Verificar se clique no sol abre modal anual

---

## 🚀 ETAPA 8: VALIDAÇÃO FINAL

### Passo 8a: Verificação de Funcionamento

- [ ] Salvar um insight mensal
- [ ] Verificar se aparece no banco
- [ ] Atualizar o mesmo insight
- [ ] Verificar se atualizou (não criou novo)
- [ ] Salvar insight trimestral
- [ ] Salvar insight anual
- [ ] Limpar dados de teste do banco

**Comando para limpar:**
```sql
DELETE FROM monthly_insights WHERE user_id = 1;
DELETE FROM quarterly_insights WHERE user_id = 1;
DELETE FROM annual_insights WHERE user_id = 1;
```

### Passo 8b: Verificação de Erros

- [ ] Tentar salvar sem fase lunar válida
- [ ] Tentar salvar com mês inválido
- [ ] Tentar salvar sem estar autenticado
- [ ] Verificar mensagens de erro apropriadas

### Passo 8c: Performance

- [ ] Verificar velocidade de salvamento (< 1s)
- [ ] Verificar velocidade de leitura (se implementada)
- [ ] Verificar se há índices adequados

---

## 📚 DOCUMENTAÇÃO

### Passo 9a: Documentação Criada

- [ ] `doc/INSIGHTS_BANCO_DADOS.md` - Guia completo das tabelas
- [ ] `doc/INSIGHTS_TABELAS_VISUAL.md` - Visualização das tabelas
- [ ] `doc/INSIGHTS_API.md` - Documentação das APIs
- [ ] `infra/db/migration-insights.sql` - Script SQL

### Passo 9b: Atualizar README (Opcional)

- [ ] Adicionar seção sobre insights no `README.md`
- [ ] Incluir links para documentação
- [ ] Exemplos de uso

---

## ❌ TROUBLESHOOTING

### Problema: Erro ao criar tabela

**Solução:**
- Verifique se a tabela `users` existe
- Verifique a sintaxe SQL
- Verifique permissões no banco

### Problema: Erro 401 (Unauthorized)

**Solução:**
- Verifique se está autenticado
- Verifique se a sessão é válida
- Verifique `lib/auth.ts`

### Problema: Erro ao salvar insight

**Solução:**
- Verifique os logs no servidor (`npm run dev`)
- Verifique se o banco está acessível
- Verifique a conexão `DATABASE_URL`

### Problema: Modal não abre

**Solução:**
- Verifique se o modal está importado
- Verifique se o estado está sendo controlado
- Verifique console.log do browser

---

## 🎉 Conclusão

- [ ] Todas as etapas completadas
- [ ] Banco de dados funcionando
- [ ] APIs respondendo
- [ ] Frontend salvando insights
- [ ] Documentação atualizada

**Próximos passos:**
- Implementar leitura/edição/deleção de insights
- Criar dashboard para visualizar insights
- Integrar com Google Sheets (se desejar)
- Adicionar filtros e ordenação
