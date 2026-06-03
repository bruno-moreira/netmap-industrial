const portModel = require('../model/portModel');
const deviceModel = require('../model/deviceModel');
const switchModel = require('../model/switchModel');
const vlanModel = require('../model/vlanModel');
const { HttpError } = require('../utils/HttpError');
const { getPortDisplayColor, isValidMac, normalizeMac } = require('../utils/networkValidators');

async function getById(id) {
  const port = await portModel.findById(id);
  if (!port) throw new HttpError(404, 'Porta não encontrada');
  return {
    ...port,
    display_color: getPortDisplayColor(port),
    history: await portModel.getHistory(id, 20),
  };
}

async function update(id, payload) {
  const current = await portModel.findById(id);
  if (!current) throw new HttpError(404, 'Porta não encontrada');

  if (payload.vlan_id) {
    const vlan = await vlanModel.findById(payload.vlan_id);
    if (!vlan) throw new HttpError(400, 'VLAN inválida');
  }

  if (payload.connected_device_id) {
    const device = await deviceModel.findById(payload.connected_device_id);
    if (!device) throw new HttpError(400, 'Equipamento conectado inválido');
    if (!payload.mac_address) payload.mac_address = device.mac_address;
    if (!payload.status) payload.status = 'connected';
    // Se conectar a um dispositivo, desconectar de switch
    payload.connected_switch_id = null;
  }

  if (payload.connected_switch_id) {
    const sw = await switchModel.findById(payload.connected_switch_id);
    if (!sw) throw new HttpError(400, 'Switch conectado inválido');
    // Não pode conectar a si mesmo
    if (sw.id === current.switch_id) {
      throw new HttpError(400, 'Não é possível conectar o switch a si mesmo');
    }
    if (!payload.status) payload.status = 'connected';
    // Se conectar a um switch, desconectar de dispositivo
    payload.connected_device_id = null;
  }

  if (payload.mac_address && !isValidMac(payload.mac_address)) {
    throw new HttpError(400, 'MAC Address inválido');
  }
  if (payload.mac_address) payload.mac_address = normalizeMac(payload.mac_address);

  const updated = await portModel.update(id, payload);
  await portModel.addHistory(id, 'update', current, updated);

  return {
    ...updated,
    display_color: getPortDisplayColor(updated),
    history: await portModel.getHistory(id, 20),
  };
}

async function create(payload) {
  try {
    const port = await portModel.create(payload);
    return getById(port.id);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Número de porta já existe neste switch');
    throw err;
  }
}

module.exports = { getById, update, create };
