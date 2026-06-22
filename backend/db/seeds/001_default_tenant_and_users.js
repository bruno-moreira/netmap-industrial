import bcrypt from 'bcrypt';

export async function seed(knex) {
  // Deletes ALL existing entries in dependent order
  await knex('users').del();
  await knex('roles').del();
  await knex('tenants').del();

  // 1. Insert Default Tenant
  const [tenant] = await knex('tenants')
    .insert({
      name: 'Empresa Exemplo',
      slug: 'empresa-exemplo',
      description: 'Tenant padrão para testes'
    })
    .returning('*');

  // 2. Insert Roles
  const rolesData = [
    { name: 'Root', slug: 'root', description: 'Acesso completo ao sistema, pode gerenciar tenants e usuários' },
    { name: 'Administrador', slug: 'admin', description: 'Acesso total ao sistema' },
    { name: 'Técnico', slug: 'tecnico', description: 'Acesso para gerenciar switches, dispositivos e vlans' },
    { name: 'Visualizador', slug: 'visualizador', description: 'Apenas leitura de dados' }
  ];
  
  const insertedRoles = await knex('roles').insert(rolesData).returning('*');
  
  const rootRole = insertedRoles.find(r => r.slug === 'root');
  const adminRole = insertedRoles.find(r => r.slug === 'admin');

  // 3. Insert Users
  const adminHash = await bcrypt.hash('admin123', 10);
  const rootHash = await bcrypt.hash('root123', 10);

  await knex('users').insert([
    {
      tenant_id: tenant.id,
      role_id: adminRole.id,
      name: 'Administrador',
      email: 'admin@empresa-exemplo.com',
      password_hash: adminHash,
      is_active: true
    },
    {
      tenant_id: tenant.id,
      role_id: rootRole.id,
      name: 'Root User',
      email: 'root@netmap.local',
      password_hash: rootHash,
      is_active: true
    }
  ]);
}
