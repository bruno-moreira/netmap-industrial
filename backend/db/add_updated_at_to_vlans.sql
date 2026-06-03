-- Adiciona coluna updated_at na tabela vlans (se não existir)
ALTER TABLE vlans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Cria/atualiza trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria trigger para vlans (se não existir)
DROP TRIGGER IF EXISTS trg_vlans_updated ON vlans;
CREATE TRIGGER trg_vlans_updated
  BEFORE UPDATE ON vlans
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Verifica se funcionou
SELECT 'OK' AS status, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'vlans' AND column_name = 'updated_at';
