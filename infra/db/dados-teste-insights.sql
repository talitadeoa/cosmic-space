-- ============================================================
-- DADOS DE TESTE: Exemplos para Insights
-- ============================================================
-- Use este arquivo para inserir dados de teste
-- Útil para validar estrutura e testar queries
-- ============================================================

-- ============================================================
-- 1. INSIGHTS MENSAIS - DADOS DE TESTE
-- ============================================================

-- Exemplo 1: Insights para Janeiro (Mês #1)
INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
VALUES 
  (1, 'luaNova', 1, 'Comecei janeiro com intenções claras de crescimento pessoal e profissional.'),
  (1, 'luaCrescente', 1, 'Essa semana observei um crescimento significativo em meus projetos. Sinto energia renovada.'),
  (1, 'luaCheia', 1, 'Os resultados chegaram! Consegui implementar as ideias que plantei. Estou feliz com o progresso.'),
  (1, 'luaMinguante', 1, 'Tempo de reflexão. Deixei ir o que não estava me servindo e reconheço meus aprendizados do mês.')
ON CONFLICT (user_id, moon_phase, month_number) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Exemplo 2: Insights para Fevereiro (Mês #2)
INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
VALUES 
  (1, 'luaNova', 2, 'Fevereiro chega com novos planos. Plantei sementes de mudança.'),
  (1, 'luaCrescente', 2, 'Crescimento contínuo. Vejo progresso em tudo que comecei.'),
  (1, 'luaCheia', 2, 'Colheita lunar! Resultados práticos e visíveis em meu dia a dia.'),
  (1, 'luaMinguante', 2, 'Reflexão sobre fevereiro. Muitos aprendizados, muita transformação.')
ON CONFLICT (user_id, moon_phase, month_number) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Exemplo 3: Inserir para outro usuário
INSERT INTO monthly_insights (user_id, moon_phase, month_number, insight)
VALUES 
  (2, 'luaNova', 1, 'Novo usuário, novo começo. Janeiro é meu mês de transformação.'),
  (2, 'luaCrescente', 1, 'Começando a ver os primeiros sinais de mudança.'),
  (2, 'luaCheia', 1, 'Grande lua cheia! Muita energia e realização.'),
  (2, 'luaMinguante', 1, 'Fechar ciclos, começar novo.')
ON CONFLICT (user_id, moon_phase, month_number) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- ============================================================
-- 2. INSIGHTS TRIMESTRAIS - DADOS DE TESTE
-- ============================================================

-- Exemplo: Q1 (Janeiro-Março) - Trimestre 1
INSERT INTO quarterly_insights (user_id, moon_phase, quarter_number, insight)
VALUES 
  (1, 'luaNova', 1, 'Q1 começou com intenções poderosas. Plantei sementes de transformação pessoal.'),
  (1, 'luaCrescente', 1, 'Crescimento exponencial em janeiro. Vejo os frutos do meu trabalho.'),
  (1, 'luaCheia', 1, 'Lua cheia em fevereiro trouxe realização. Colho o que plantei em janeiro.'),
  (1, 'luaMinguante', 1, 'Reflexão trimestral: Q1 foi produtivo. Deixo para trás o que não serve em Q2.')
ON CONFLICT (user_id, moon_phase, quarter_number) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Exemplo: Q2 (Abril-Junho) - Trimestre 2
INSERT INTO quarterly_insights (user_id, moon_phase, quarter_number, insight)
VALUES 
  (1, 'luaNova', 2, 'Q2 começa com novos projetos. Abril traz renovação.'),
  (1, 'luaCrescente', 2, 'Crescimento em maio. Meus projetos ganham momentum.'),
  (1, 'luaCheia', 2, 'Junho brilhante! Colheita abundante do trimestre.'),
  (1, 'luaMinguante', 2, 'Fim de Q2. Balanço positivo. Preparando-me para Q3.')
ON CONFLICT (user_id, moon_phase, quarter_number) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Exemplo: Q3 (Julho-Setembro) - Trimestre 3
INSERT INTO quarterly_insights (user_id, moon_phase, quarter_number, insight)
VALUES 
  (1, 'luaNova', 3, 'Q3 traz novas intenções. Julho é renovação.'),
  (1, 'luaCrescente', 3, 'Agosto: crescimento consistente. Vejo evolução.'),
  (1, 'luaCheia', 3, 'Setembro brilha! Grande colheita trimestral.'),
  (1, 'luaMinguante', 3, 'Reflexão sobre Q3. Muito aprendizado e transformação.')
ON CONFLICT (user_id, moon_phase, quarter_number) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Exemplo: Q4 (Outubro-Dezembro) - Trimestre 4
INSERT INTO quarterly_insights (user_id, moon_phase, quarter_number, insight)
VALUES 
  (1, 'luaNova', 4, 'Q4 final. Outubro: plantio de intenções para o próximo ano.'),
  (1, 'luaCrescente', 4, 'Novembro: crescimento rumo ao encerramento do ano.'),
  (1, 'luaCheia', 4, 'Dezembro: grande colheita anual. Ano produtivo!'),
  (1, 'luaMinguante', 4, 'Reflexão de encerramento. Um ano de muito crescimento e aprendizado.')
ON CONFLICT (user_id, moon_phase, quarter_number) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- ============================================================
-- 3. INSIGHTS ANUAIS - DADOS DE TESTE
-- ============================================================

-- Exemplo: Insights para 2024
INSERT INTO annual_insights (user_id, year, insight)
VALUES 
  (1, 2024, '2024 foi um ano transformador. Aprendi sobre minha resiliência, cresci em áreas inesperadas e colhi os frutos de sementes plantadas há tempos. Um ano de ouro para meu desenvolvimento pessoal.')
ON CONFLICT (user_id, year) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Exemplo: Insights para 2025
INSERT INTO annual_insights (user_id, year, insight)
VALUES 
  (1, 2025, '2025: O ano do aprofundamento. Vou focar em consolidar aprendizados de 2024 e mergulhar em novos desafios. Mais intencionalidade, mais presença, mais sabedoria.')
ON CONFLICT (user_id, year) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- Exemplo: Outro usuário
INSERT INTO annual_insights (user_id, year, insight)
VALUES 
  (2, 2024, '2024 foi sobre começar de novo. Deixei ir o passado e construí uma base sólida para o futuro.')
ON CONFLICT (user_id, year) 
DO UPDATE SET insight = EXCLUDED.insight, updated_at = NOW();

-- ============================================================
-- QUERIES DE VERIFICAÇÃO
-- ============================================================

-- Ver todos os insights mensais do usuário 1
SELECT 
  'mensal' as tipo,
  moon_phase,
  month_number as periodo,
  insight,
  created_at,
  updated_at
FROM monthly_insights
WHERE user_id = 1
ORDER BY month_number, 
  CASE 
    WHEN moon_phase = 'luaNova' THEN 1
    WHEN moon_phase = 'luaCrescente' THEN 2
    WHEN moon_phase = 'luaCheia' THEN 3
    WHEN moon_phase = 'luaMinguante' THEN 4
  END;

-- Ver todos os insights trimestrais do usuário 1
SELECT 
  'trimestral' as tipo,
  moon_phase,
  quarter_number as trimestre,
  insight,
  created_at,
  updated_at
FROM quarterly_insights
WHERE user_id = 1
ORDER BY quarter_number,
  CASE 
    WHEN moon_phase = 'luaNova' THEN 1
    WHEN moon_phase = 'luaCrescente' THEN 2
    WHEN moon_phase = 'luaCheia' THEN 3
    WHEN moon_phase = 'luaMinguante' THEN 4
  END;

-- Ver todos os insights anuais do usuário 1
SELECT 
  'anual' as tipo,
  year,
  insight,
  created_at,
  updated_at
FROM annual_insights
WHERE user_id = 1
ORDER BY year DESC;

-- Ver TODOS os insights de um usuário (combinado)
SELECT 
  'mensal'::TEXT as tipo,
  moon_phase,
  month_number::TEXT as periodo,
  insight,
  created_at
FROM monthly_insights
WHERE user_id = 1

UNION ALL

SELECT 
  'trimestral'::TEXT,
  moon_phase,
  quarter_number::TEXT,
  insight,
  created_at
FROM quarterly_insights
WHERE user_id = 1

UNION ALL

SELECT 
  'anual'::TEXT,
  NULL as moon_phase,
  year::TEXT,
  insight,
  created_at
FROM annual_insights
WHERE user_id = 1

ORDER BY created_at DESC;

-- ============================================================
-- QUERIES DE ANÁLISE
-- ============================================================

-- Contar insights por tipo
SELECT 
  'Mensais' as tipo,
  COUNT(*) as total
FROM monthly_insights
WHERE user_id = 1

UNION ALL

SELECT 
  'Trimestrais',
  COUNT(*)
FROM quarterly_insights
WHERE user_id = 1

UNION ALL

SELECT 
  'Anuais',
  COUNT(*)
FROM annual_insights
WHERE user_id = 1;

-- Insights por mês (contagem)
SELECT 
  month_number,
  COUNT(*) as total
FROM monthly_insights
WHERE user_id = 1
GROUP BY month_number
ORDER BY month_number;

-- Insights completados (todas as 4 fases de um mês)
SELECT 
  month_number,
  COUNT(*) as fases_preenchidas
FROM monthly_insights
WHERE user_id = 1
GROUP BY month_number
HAVING COUNT(*) = 4
ORDER BY month_number;

-- Fases mais utilizadas
SELECT 
  moon_phase,
  COUNT(*) as total_insights
FROM (
  SELECT moon_phase FROM monthly_insights WHERE user_id = 1
  UNION ALL
  SELECT moon_phase FROM quarterly_insights WHERE user_id = 1
) combined
GROUP BY moon_phase
ORDER BY total_insights DESC;

-- ============================================================
-- LIMPEZA (Remover dados de teste)
-- ============================================================

-- ⚠️ CUIDADO: Descomente para deletar dados de teste

/*
DELETE FROM monthly_insights WHERE user_id IN (1, 2);
DELETE FROM quarterly_insights WHERE user_id IN (1, 2);
DELETE FROM annual_insights WHERE user_id IN (1, 2);
*/

-- ============================================================
-- FIM DOS DADOS DE TESTE
-- ============================================================
