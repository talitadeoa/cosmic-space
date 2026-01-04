-- ========================================
-- Fix: Garantir version=1 para ilhas com NULL
-- ========================================

-- Corrigir islands com version NULL
UPDATE islands 
SET version = 1 
WHERE version IS NULL;

-- Garantir que não haja NULLs no futuro (por segurança)
ALTER TABLE islands ALTER COLUMN version SET NOT NULL;
ALTER TABLE islands ALTER COLUMN version SET DEFAULT 1;

-- Adicionar constraint para garantir version >= 1 (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'islands_version_min'
    ) THEN
        ALTER TABLE islands ADD CONSTRAINT islands_version_min CHECK (version >= 1);
    END IF;
END $$;
