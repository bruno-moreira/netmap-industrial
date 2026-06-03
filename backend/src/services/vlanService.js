const vlanModel = require('../model/vlanModel');
const { HttpError } = require('../utils/HttpError');

async function list() {
  return vlanModel.findAll();
}

async function getById(id) {
  const vlan = await vlanModel.findById(id);
  if (!vlan) throw new HttpError(404, 'VLAN não encontrada');
  return vlan;
}

async function create(payload) {
  try {
    return await vlanModel.create(payload);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Número de VLAN já cadastrado');
    throw err;
  }
}

async function update(id, payload) {
  await getById(id);
  try {
    const updated = await vlanModel.update(id, payload);
    if (!updated) throw new HttpError(404, 'VLAN não encontrada');
    return updated;
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Número de VLAN já cadastrado');
    throw err;
  }
}

async function remove(id) {
  await getById(id);
  const deleted = await vlanModel.remove(id);
  if (!deleted) throw new HttpError(404, 'VLAN não encontrada');
}

module.exports = { list, getById, create, update, remove };
