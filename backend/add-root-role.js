const { pool } = require('./config/db');
const bcrypt = require('bcrypt');

async function addRootRole() {
  console.log('Adicionando role root e usuário root...');
  
  try {
    // Adicionar role root
    await pool.query(
      `INSERT INTO roles (name, slug, description)
       VALUES ($1, $2, $3)
       ON CONFLICT (slug) DO NOTHING`,
      ['Root', 'root', 'Acesso completo ao sistema, pode gerenciar tenants e usuários']
    );
    
    // Obter tenant padrão (primeiro)
    const { rows: tenants } = await pool.query(`SELECT id FROM tenants LIMIT 1`);
    if (tenants.length === 0) {
      console.warn('Nenhum tenant encontrado. Crie um tenant primeiro.');
      return;
    }
    const tenantId = tenants[0].id;
    
    // Obter role root
    const { rows: roles } = await pool.query(`SELECT id FROM roles WHERE slug = 'root'`);
    const rootRoleId = roles[0].id;
    
    // Criar usuário root
    const passwordHash = await bcrypt.hash('root123', 10);
    await pool.query(
      `INSERT INTO users (tenant_id, role_id, name, email, password_hash, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [tenantId, rootRoleId, 'Root User', 'root@netmap.local', passwordHash, true]
    );
    
    console.log('✅ Role root e usuário root criados com sucesso!');
    console.log('📧 Email: root@netmap.local');
    console.log('🔑 Senha: root123');
    
  } catch (err) {
    console.error('❌ Erro:', err);
  } finally {
    await pool.end();
  }
}

addRootRole();
