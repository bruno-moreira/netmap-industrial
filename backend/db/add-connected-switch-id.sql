-- Adicionar coluna connected_switch_id na tabela switch_ports
ALTER TABLE switch_ports ADD COLUMN IF NOT EXISTS connected_switch_id INTEGER REFERENCES switches (id) ON DELETE SET NULL;

-- Atualizar o PORT_SELECT no model (mas vamos fazer via código)
-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_switch_ports_switch ON switch_ports (connected_switch_id);
