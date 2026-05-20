-- =============================================================================
-- NetMap Industrial — Script PostgreSQL
-- Banco: netmap
--
-- Uso:
--   psql -U postgres -f db/bd.sql
--   ou, criando o banco antes:
--   psql -U postgres -c "CREATE DATABASE netmap ENCODING 'UTF8';"
--   psql -U postgres -d netmap -f db/bd.sql
-- =============================================================================

-- Opcional: criar banco (execute conectado em postgres, não dentro de netmap)
-- CREATE DATABASE netmap
--   WITH ENCODING 'UTF8'
--        LC_COLLATE = 'pt_BR.UTF-8'
--        LC_CTYPE = 'pt_BR.UTF-8'
--        TEMPLATE = template0;

-- \c netmap

-- -----------------------------------------------------------------------------
-- Remoção (ordem inversa das dependências)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS port_history CASCADE;
DROP TABLE IF EXISTS device_links CASCADE;
DROP TABLE IF EXISTS switch_ports CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS switches CASCADE;
DROP TABLE IF EXISTS vlans CASCADE;
DROP TABLE IF EXISTS device_types CASCADE;

DROP TYPE IF EXISTS device_status CASCADE;
DROP TYPE IF EXISTS port_status CASCADE;

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------
CREATE TYPE device_status AS ENUM (
  'online',
  'offline',
  'unknown',
  'maintenance'
);

CREATE TYPE port_status AS ENUM (
  'free',
  'connected',
  'error',
  'disabled'
);

-- -----------------------------------------------------------------------------
-- Tabelas
-- -----------------------------------------------------------------------------

CREATE TABLE device_types (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(50)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(50),
  color       VARCHAR(20),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE device_types IS 'Tipos de equipamento: pc, printer, ap, camera, turnstile, etc.';

CREATE TABLE vlans (
  id          SERIAL PRIMARY KEY,
  vlan_number INTEGER      NOT NULL UNIQUE CHECK (vlan_number BETWEEN 1 AND 4094),
  name        VARCHAR(100) NOT NULL,
  color       VARCHAR(20)  NOT NULL DEFAULT '#3b82f6',
  description TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE vlans IS 'VLANs da rede industrial (cor usada no mapa visual)';

CREATE TABLE switches (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  ip_address     VARCHAR(45),
  brand          VARCHAR(80),
  model          VARCHAR(80),
  rack_id        VARCHAR(50),
  location       VARCHAR(200),
  snmp_community VARCHAR(100),
  port_count     INTEGER      NOT NULL DEFAULT 24 CHECK (port_count BETWEEN 4 AND 96),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_switches_name ON switches (name);
CREATE INDEX idx_switches_ip ON switches (ip_address);

COMMENT ON TABLE switches IS 'Switches gerenciados no mapa de rede';

CREATE TABLE devices (
  id              SERIAL PRIMARY KEY,
  device_type_id  INTEGER       NOT NULL REFERENCES device_types (id) ON DELETE RESTRICT,
  name            VARCHAR(150)  NOT NULL,
  ip_address      VARCHAR(45)   UNIQUE,
  mac_address     VARCHAR(17),
  location        VARCHAR(200),
  status          device_status NOT NULL DEFAULT 'unknown',
  metadata        JSONB         NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_devices_mac ON devices (mac_address);
CREATE INDEX idx_devices_type ON devices (device_type_id);
CREATE INDEX idx_devices_status ON devices (status);
CREATE INDEX idx_devices_name ON devices (name);

COMMENT ON TABLE devices IS 'Equipamentos de rede: impressoras, câmeras, catracas, APs, etc.';

CREATE TABLE switch_ports (
  id                  SERIAL PRIMARY KEY,
  switch_id           INTEGER      NOT NULL REFERENCES switches (id) ON DELETE CASCADE,
  port_number         INTEGER      NOT NULL CHECK (port_number BETWEEN 1 AND 96),
  status              port_status  NOT NULL DEFAULT 'free',
  vlan_id             INTEGER      REFERENCES vlans (id) ON DELETE SET NULL,
  mac_address         VARCHAR(17),
  connected_device_id INTEGER      REFERENCES devices (id) ON DELETE SET NULL,
  is_trunk            BOOLEAN      NOT NULL DEFAULT FALSE,
  label               VARCHAR(100),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (switch_id, port_number)
);

CREATE INDEX idx_switch_ports_switch ON switch_ports (switch_id);
CREATE INDEX idx_switch_ports_vlan ON switch_ports (vlan_id);
CREATE INDEX idx_switch_ports_device ON switch_ports (connected_device_id);
CREATE INDEX idx_switch_ports_status ON switch_ports (status);

COMMENT ON TABLE switch_ports IS 'Portas físicas de cada switch';

CREATE TABLE device_links (
  id                SERIAL PRIMARY KEY,
  source_device_id  INTEGER     REFERENCES devices (id) ON DELETE CASCADE,
  target_device_id  INTEGER     REFERENCES devices (id) ON DELETE CASCADE,
  source_port_id    INTEGER     REFERENCES switch_ports (id) ON DELETE SET NULL,
  link_type         VARCHAR(50) NOT NULL DEFAULT 'ethernet',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_links_source ON device_links (source_device_id);
CREATE INDEX idx_device_links_target ON device_links (target_device_id);

COMMENT ON TABLE device_links IS 'Topologia / vínculos entre equipamentos';

CREATE TABLE port_history (
  id         SERIAL PRIMARY KEY,
  port_id    INTEGER      NOT NULL REFERENCES switch_ports (id) ON DELETE CASCADE,
  action     VARCHAR(50)  NOT NULL,
  old_value  JSONB,
  new_value  JSONB,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_port_history_port ON port_history (port_id);
CREATE INDEX idx_port_history_created ON port_history (created_at DESC);

COMMENT ON TABLE port_history IS 'Histórico de alterações em portas';

-- -----------------------------------------------------------------------------
-- Função: atualizar updated_at automaticamente
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_switches_updated
  BEFORE UPDATE ON switches
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_devices_updated
  BEFORE UPDATE ON devices
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_switch_ports_updated
  BEFORE UPDATE ON switch_ports
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- -----------------------------------------------------------------------------
-- Dados iniciais (seed de demonstração)
-- -----------------------------------------------------------------------------

INSERT INTO device_types (slug, name, icon, color) VALUES
  ('pc',                'PC',                 'monitor',   '#64748b'),
  ('printer',           'Impressora',         'printer',   '#22c55e'),
  ('time_clock',        'Relógio de ponto',   'clock',     '#eab308'),
  ('camera',            'Câmera IP',          'camera',    '#8b5cf6'),
  ('dvr',               'DVR/NVR',            'hard-drive','#6366f1'),
  ('turnstile',         'Catraca',            'door-open', '#f97316'),
  ('ap',                'Access Point',       'wifi',      '#06b6d4'),
  ('ip_phone',          'Telefone IP',        'phone',     '#14b8a6'),
  ('extension_antenna', 'Antena de ramal',    'radio',     '#a855f7'),
  ('server',            'Servidor',           'server',    '#0ea5e9'),
  ('switch',            'Switch',             'network',   '#334155'),
  ('router',            'Roteador',           'router',    '#1e293b');

INSERT INTO vlans (vlan_number, name, color, description) VALUES
  (10, 'Administração', '#3b82f6', 'Rede administrativa'),
  (20, 'CFTV',          '#8b5cf6', 'Câmeras e gravadores'),
  (30, 'Impressoras',   '#86efac', 'Impressoras de rede'),
  (40, 'Catracas',      '#f97316', 'Controle de acesso'),
  (99, 'Trunk',         '#171717', 'Enlaces trunk');

INSERT INTO switches (name, ip_address, brand, model, rack_id, location, port_count) VALUES
  ('SW-ADM-01', '192.168.1.10', 'HP', '2530-24', 'RACK-A1', 'Administrativo', 24);

INSERT INTO devices (device_type_id, name, ip_address, mac_address, location, status) VALUES
  (
    (SELECT id FROM device_types WHERE slug = 'printer'),
    'Impressora RH',
    '192.168.30.10',
    'AA:BB:CC:DD:EE:01',
    'Administrativo',
    'online'
  ),
  (
    (SELECT id FROM device_types WHERE slug = 'camera'),
    'Câmera Portaria',
    '192.168.20.50',
    'AA:BB:CC:DD:EE:02',
    'Portaria',
    'online'
  );

-- Portas 1–24 do switch SW-ADM-01
INSERT INTO switch_ports (switch_id, port_number, status)
SELECT
  (SELECT id FROM switches WHERE name = 'SW-ADM-01'),
  n,
  'free'::port_status
FROM generate_series(1, 24) AS n;

-- Porta 8: câmera (VLAN 20)
UPDATE switch_ports SET
  status = 'connected',
  vlan_id = (SELECT id FROM vlans WHERE vlan_number = 20),
  mac_address = 'AA:BB:CC:DD:EE:02',
  connected_device_id = (SELECT id FROM devices WHERE name = 'Câmera Portaria'),
  label = 'Câmera Portaria'
WHERE switch_id = (SELECT id FROM switches WHERE name = 'SW-ADM-01')
  AND port_number = 8;

-- Porta 12: impressora (VLAN 30)
UPDATE switch_ports SET
  status = 'connected',
  vlan_id = (SELECT id FROM vlans WHERE vlan_number = 30),
  mac_address = 'AA:BB:CC:DD:EE:01',
  connected_device_id = (SELECT id FROM devices WHERE name = 'Impressora RH'),
  label = 'Impressora RH'
WHERE switch_id = (SELECT id FROM switches WHERE name = 'SW-ADM-01')
  AND port_number = 12;

-- Porta 24: uplink trunk (VLAN 99)
UPDATE switch_ports SET
  is_trunk = TRUE,
  vlan_id = (SELECT id FROM vlans WHERE vlan_number = 99),
  label = 'Uplink'
WHERE switch_id = (SELECT id FROM switches WHERE name = 'SW-ADM-01')
  AND port_number = 24;

-- -----------------------------------------------------------------------------
-- Views úteis para consultas / dashboard
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
  (SELECT COUNT(*)::INTEGER FROM switches)       AS total_switches,
  (SELECT COUNT(*)::INTEGER FROM switch_ports)   AS total_ports,
  (SELECT COUNT(*)::INTEGER FROM switch_ports WHERE status = 'connected') AS ports_connected,
  (SELECT COUNT(*)::INTEGER FROM switch_ports WHERE status = 'free')      AS ports_free,
  (SELECT COUNT(*)::INTEGER FROM switch_ports WHERE status = 'error')     AS ports_error,
  (SELECT COUNT(*)::INTEGER FROM devices WHERE status = 'online')  AS devices_online,
  (SELECT COUNT(*)::INTEGER FROM devices WHERE status = 'offline') AS devices_offline,
  (SELECT COUNT(*)::INTEGER FROM vlans)        AS total_vlans,
  (SELECT COUNT(*)::INTEGER FROM devices)      AS total_devices;

CREATE OR REPLACE VIEW v_port_details AS
SELECT
  sp.id,
  sp.switch_id,
  s.name          AS switch_name,
  sp.port_number,
  sp.status,
  sp.is_trunk,
  sp.label,
  sp.mac_address,
  v.id            AS vlan_id,
  v.vlan_number,
  v.name          AS vlan_name,
  v.color         AS vlan_color,
  d.id            AS device_id,
  d.name          AS device_name,
  d.ip_address    AS device_ip,
  d.mac_address   AS device_mac,
  d.location      AS device_location,
  d.status        AS device_status,
  dt.slug         AS device_type_slug,
  dt.name         AS device_type_name,
  dt.color        AS device_type_color,
  sp.updated_at
FROM switch_ports sp
JOIN switches s ON s.id = sp.switch_id
LEFT JOIN vlans v ON v.id = sp.vlan_id
LEFT JOIN devices d ON d.id = sp.connected_device_id
LEFT JOIN device_types dt ON dt.id = d.device_type_id;

-- -----------------------------------------------------------------------------
-- Fim
-- -----------------------------------------------------------------------------
SELECT 'NetMap Industrial: schema e dados iniciais aplicados com sucesso.' AS resultado;
