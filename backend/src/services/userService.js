import bcrypt from 'bcrypt';
import userModel from '../model/userModel.js';
import roleModel from '../model/roleModel.js';
import { HttpError } from '../utils/HttpError.js';

async function getAllUsers(tenantId) {
  return userModel.findAll(tenantId);
}

async function getUserById(id, tenantId) {
  const user = await userModel.findById(id);
  if (!user) throw new HttpError(404, 'Usuário não encontrado');
  if (user.tenant_id !== tenantId) throw new HttpError(403, 'Acesso negado');
  return user;
}

async function createUser(data, tenantId) {
  const { name, email, password, roleId } = data;
  
  if (!name || !email || !password || !roleId) {
    throw new HttpError(400, 'Todos os campos são obrigatórios');
  }
  
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new HttpError(409, 'Email já está em uso');
  }
  
  const role = await roleModel.findById(roleId);
  if (!role) {
    throw new HttpError(400, 'Role inválida');
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const user = await userModel.create({
    tenant_id: tenantId,
    role_id: roleId,
    name,
    email,
    password_hash: passwordHash,
    is_active: true
  });
  
  return getUserById(user.id, tenantId);
}

async function updateUser(id, data, tenantId, _currentUserId) {
  await getUserById(id, tenantId);
  
  const updateData = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.roleId) updateData.role_id = data.roleId;
  if (data.password) updateData.password_hash = await bcrypt.hash(data.password, 10);
  if (typeof data.isActive === 'boolean') updateData.is_active = data.isActive;
  
  return userModel.update(id, updateData);
}

async function deleteUser(id, tenantId) {
  await getUserById(id, tenantId);
  return userModel.remove(id);
}

export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
