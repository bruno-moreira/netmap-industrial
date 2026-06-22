import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../model/userModel.js';
import tenantModel from '../model/tenantModel.js';
import roleModel from '../model/roleModel.js';
import { HttpError } from '../utils/HttpError.js';

async function login(email, password) {
  const user = await userModel.findByEmail(email);
  
  if (!user) {
    throw new HttpError(401, 'Credenciais inválidas');
  }
  
  if (!user.is_active) {
    throw new HttpError(401, 'Usuário inativo');
  }
  
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  
  if (!passwordMatch) {
    throw new HttpError(401, 'Credenciais inválidas');
  }
  
  const accessToken = jwt.sign(
    { userId: user.id, tenantId: user.tenant_id, role: user.role_slug },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '7d' }
  );
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role_slug,
      roleName: user.role_name,
      tenant: {
        id: user.tenant_id,
        name: user.tenant_name,
        slug: user.tenant_slug
      }
    },
    accessToken,
    refreshToken
  };
}

async function register(data) {
  const { tenantName, tenantSlug, userName, userEmail, userPassword } = data;
  
  const existingTenant = await tenantModel.findBySlug(tenantSlug);
  if (existingTenant) {
    throw new HttpError(409, 'Já existe um tenant com esse slug');
  }
  
  const existingUser = await userModel.findByEmail(userEmail);
  if (existingUser) {
    throw new HttpError(409, 'Já existe um usuário com esse email');
  }
  
  const tenant = await tenantModel.create({
    name: tenantName,
    slug: tenantSlug
  });
  
  const adminRole = await roleModel.findBySlug('admin');
  const passwordHash = await bcrypt.hash(userPassword, 10);
  
  const user = await userModel.create({
    tenant_id: tenant.id,
    role_id: adminRole.id,
    name: userName,
    email: userEmail,
    password_hash: passwordHash
  });
  
  const accessToken = jwt.sign(
    { userId: user.id, tenantId: tenant.id, role: adminRole.slug },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: '7d' }
  );
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: adminRole.slug,
      roleName: adminRole.name,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug
      }
    },
    accessToken,
    refreshToken
  };
}

export { login, register };
export default { login, register };
