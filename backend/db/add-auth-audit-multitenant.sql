-- =============================================
-- 1. Criar tabela de Tenants (Equipes/Organizações)
-- =============================================
CREATE TABLE IF NOT EXISTS tenants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. Criar tabela de Roles
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir roles padrão
INSERT INTO roles (name, slug, description) VALUES
  ('Administrador', 'admin', 'Acesso total ao sistema'),
  ('Técnico', 'tecnico', 'Acesso para gerenciar switches, dispositivos e vlans'),
  ('Visualizador', 'visualizador', 'Apenas leitura de dados')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 3. Criar tabela de Users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- 4. Adicionar tenant_id, created_by e updated_by nas tabelas existentes
-- =============================================

-- Adicionar tenant_id na tabela switches
ALTER TABLE switches ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE switches ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE switches ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_switches_tenant_id ON switches(tenant_id);

-- Adicionar tenant_id na tabela devices
ALTER TABLE devices ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE devices ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_devices_tenant_id ON devices(tenant_id);

-- Adicionar tenant_id na tabela vlans
ALTER TABLE vlans ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE vlans ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE vlans ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_vlans_tenant_id ON vlans(tenant_id);

-- Adicionar tenant_id na tabela switch_ports
ALTER TABLE switch_ports ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE switch_ports ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE switch_ports ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_switch_ports_tenant_id ON switch_ports(tenant_id);

-- Adicionar tenant_id na tabela port_history
ALTER TABLE port_history ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE port_history ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_port_history_tenant_id ON port_history(tenant_id);

-- =============================================
-- 5. Criar tabela de Audit Log para todas as entidades
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(100) NOT NULL, -- 'switch', 'device', 'vlan', 'port', etc.
  entity_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================
-- 6. Criar triggers para atualizar updated_at automaticamente
-- =============================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar triggers nas novas tabelas (usando DO para evitar erros se já existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tenants_updated') THEN
    CREATE TRIGGER trg_tenants_updated
      BEFORE UPDATE ON tenants
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_roles_updated') THEN
    CREATE TRIGGER trg_roles_updated
      BEFORE UPDATE ON roles
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated') THEN
    CREATE TRIGGER trg_users_updated
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;
