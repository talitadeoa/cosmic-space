-- Adiciona colunas de emoji na tabela lunations
-- Execute este script se a tabela já existir no banco de dados

-- Adicionar coluna moon_emoji se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='lunations' AND column_name='moon_emoji'
  ) THEN
    ALTER TABLE lunations ADD COLUMN moon_emoji TEXT;
  END IF;
END $$;

-- Adicionar coluna zodiac_emoji se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='lunations' AND column_name='zodiac_emoji'
  ) THEN
    ALTER TABLE lunations ADD COLUMN zodiac_emoji TEXT;
  END IF;
END $$;

-- Opcional: Popular emojis padrão baseado nas fases e signos existentes
UPDATE lunations SET moon_emoji = 
  CASE 
    WHEN moon_phase ILIKE '%Nova%' THEN '🌑'
    WHEN moon_phase ILIKE '%Crescente%' THEN '🌓'
    WHEN moon_phase ILIKE '%Cheia%' THEN '🌕'
    WHEN moon_phase ILIKE '%Minguante%' THEN '🌗'
    ELSE '🌙'
  END
WHERE moon_emoji IS NULL;

UPDATE lunations SET zodiac_emoji = 
  CASE 
    WHEN zodiac_sign ILIKE '%Áries%' OR zodiac_sign ILIKE '%Aries%' THEN '♈'
    WHEN zodiac_sign ILIKE '%Touro%' OR zodiac_sign ILIKE '%Taurus%' THEN '♉'
    WHEN zodiac_sign ILIKE '%Gêmeos%' OR zodiac_sign ILIKE '%Gemini%' THEN '♊'
    WHEN zodiac_sign ILIKE '%Câncer%' OR zodiac_sign ILIKE '%Cancer%' THEN '♋'
    WHEN zodiac_sign ILIKE '%Leão%' OR zodiac_sign ILIKE '%Leo%' THEN '♌'
    WHEN zodiac_sign ILIKE '%Virgem%' OR zodiac_sign ILIKE '%Virgo%' THEN '♍'
    WHEN zodiac_sign ILIKE '%Libra%' THEN '♎'
    WHEN zodiac_sign ILIKE '%Escorpião%' OR zodiac_sign ILIKE '%Scorpio%' THEN '♏'
    WHEN zodiac_sign ILIKE '%Sagitário%' OR zodiac_sign ILIKE '%Sagittarius%' THEN '♐'
    WHEN zodiac_sign ILIKE '%Capricórnio%' OR zodiac_sign ILIKE '%Capricorn%' THEN '♑'
    WHEN zodiac_sign ILIKE '%Aquário%' OR zodiac_sign ILIKE '%Aquarius%' THEN '♒'
    WHEN zodiac_sign ILIKE '%Peixes%' OR zodiac_sign ILIKE '%Pisces%' THEN '♓'
    ELSE '⭐'
  END
WHERE zodiac_emoji IS NULL;

-- Commit
COMMIT;
