import deviceModel from '../model/deviceModel.js';
import deviceTypeModel from '../model/deviceTypeModel.js';
import { HttpError } from '../utils/HttpError.js';
import { isValidMac, normalizeMac } from '../utils/networkValidators.js';

async function list(filters, tenantId) {
  return deviceModel.findAll(filters, tenantId);
}

async function getById(id, tenantId) {
  const device = await deviceModel.findById(id, tenantId);
  if (!device) throw new HttpError(404, 'Equipamento não encontrado');
  return device;
}

async function create(payload, tenantId, userId) {
  const type = await deviceTypeModel.findById(payload.device_type_id);
  if (!type) throw new HttpError(400, 'Tipo de equipamento inválido');

  if (payload.mac_address && !isValidMac(payload.mac_address)) {
    throw new HttpError(400, 'MAC Address inválido');
  }

  const data = { ...payload };
  if (data.mac_address) data.mac_address = normalizeMac(data.mac_address);

  try {
    return await deviceModel.create(data, tenantId, userId);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'IP ou identificador já cadastrado');
    throw err;
  }
}

async function update(id, payload, tenantId, userId) {
  await getById(id, tenantId);

  if (payload.device_type_id) {
    const type = await deviceTypeModel.findById(payload.device_type_id);
    if (!type) throw new HttpError(400, 'Tipo de equipamento inválido');
  }

  if (payload.mac_address && !isValidMac(payload.mac_address)) {
    throw new HttpError(400, 'MAC Address inválido');
  }

  const data = { ...payload };
  if (data.mac_address) data.mac_address = normalizeMac(data.mac_address);

  try {
    return await deviceModel.update(id, data, tenantId, userId);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'IP ou identificador já cadastrado');
    throw err;
  }
}

async function remove(id, tenantId) {
  const ok = await deviceModel.remove(id, tenantId);
  if (!ok) throw new HttpError(404, 'Equipamento não encontrado');
}

export { list, getById, create, update, remove };
export default { list, getById, create, update, remove };
