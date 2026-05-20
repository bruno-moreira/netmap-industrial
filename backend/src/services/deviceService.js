const deviceModel = require('../model/deviceModel');
const deviceTypeModel = require('../model/deviceTypeModel');
const { HttpError } = require('../utils/HttpError');
const { isValidMac, normalizeMac } = require('../utils/networkValidators');

async function list(filters) {
  return deviceModel.findAll(filters);
}

async function getById(id) {
  const device = await deviceModel.findById(id);
  if (!device) throw new HttpError(404, 'Equipamento não encontrado');
  return device;
}

async function create(payload) {
  const type = await deviceTypeModel.findById(payload.device_type_id);
  if (!type) throw new HttpError(400, 'Tipo de equipamento inválido');

  if (payload.mac_address && !isValidMac(payload.mac_address)) {
    throw new HttpError(400, 'MAC Address inválido');
  }

  const data = { ...payload };
  if (data.mac_address) data.mac_address = normalizeMac(data.mac_address);

  try {
    return await deviceModel.create(data);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'IP ou identificador já cadastrado');
    throw err;
  }
}

async function update(id, payload) {
  await getById(id);

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
    return await deviceModel.update(id, data);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'IP ou identificador já cadastrado');
    throw err;
  }
}

async function remove(id) {
  const ok = await deviceModel.remove(id);
  if (!ok) throw new HttpError(404, 'Equipamento não encontrado');
}

module.exports = { list, getById, create, update, remove };
