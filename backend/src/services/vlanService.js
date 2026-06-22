import vlanModel from '../model/vlanModel.js';
import { HttpError } from '../utils/HttpError.js';

async function list(tenantId) {
  return vlanModel.findAll(tenantId);
}

async function getById(id, tenantId) {
  const vlan = await vlanModel.findById(id, tenantId);
  if (!vlan) throw new HttpError(404, 'VLAN não encontrada');
  return vlan;
}

async function create(payload, tenantId, userId) {
  try {
    return await vlanModel.create(payload, tenantId, userId);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Número de VLAN já cadastrado');
    throw err;
  }
}

async function update(id, payload, tenantId, userId) {
  await getById(id, tenantId);
  try {
    const updated = await vlanModel.update(id, payload, tenantId, userId);
    if (!updated) throw new HttpError(404, 'VLAN não encontrada');
    return updated;
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Número de VLAN já cadastrado');
    throw err;
  }
}

async function remove(id, tenantId) {
  await getById(id, tenantId);
  const deleted = await vlanModel.remove(id, tenantId);
  if (!deleted) throw new HttpError(404, 'VLAN não encontrada');
}

export { list, getById, create, update, remove };
export default { list, getById, create, update, remove };
