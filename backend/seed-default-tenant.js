const { pool } = require('./config/db');
const bcrypt = require('bcrypt');

async function seedDefaultTenant() {
  console.log('🌱 Inserindo tenant e usuário padrão...');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Criar tenant padrão
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, slug, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Empresa Exemplo', 'empresa-exemplo', 'Tenant padrão para testes']
    );
    const tenantId = tenantResult.rows[0].id;
    console.log(`✅ Tenant criado/atualizado com ID: ${tenantId}`);
    
    // 2. Obter role admin
    const roleResult = await client.query('SELECT id FROM roles WHERE slug = $1', ['admin']);
    const adminRoleId = roleResult.rows[0].id;
    
    // 3. Criar senha padrão (hash)
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // 4. Criar usuário admin padrão
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, role_id, name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [tenantId, adminRoleId, 'Administrador', 'admin@empresa-exemplo.com', passwordHash]
    );
    const userId = userResult.rows[0].id;
    console.log(`✅ Usuário admin criado/atualizado com ID: ${userId}`);
    
    // 5. Atualizar registros existentes para usar esse tenant
    await client.query('UPDATE switches SET tenant_id = $1, created_by = $2 WHERE tenant_id IS NULL', [tenantId, userId]);
    await client.query('UPDATE devices SET tenant_id = $1, created_by = $2 WHERE tenant_id IS NULL', [tenantId, userId]);
    await client.query('UPDATE vlans SET tenant_id = $1, created_by = $2 WHERE tenant_id IS NULL', [tenantId, userId]);
    await client.query('UPDATE switch_ports SET tenant_id = $1 WHERE tenant_id IS NULL', [tenantId]);
    await client.query('UPDATE port_history SET tenant_id = $1, user_id = $2 WHERE tenant_id IS NULL', [tenantId, userId]);
    
    await client.query('COMMIT');
    console.log('🌱 Seed concluído com sucesso!');
    console.log('📧 Email de login: admin@empresa-exemplo.com');
    console.log('🔑 Senha: admin123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDefaultTenant();
