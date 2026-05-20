const switchModel = require('../model/switchModel');
const portModel = require('../model/portModel');
const { HttpError } = require('../utils/HttpError');
const { getPortDisplayColor } = require('../utils/networkValidators');

async function list() {
  return switchModel.findAll();
}

async function getById(id, withPorts = false) {
  const sw = await switchModel.findById(id);
  if (!sw) throw new HttpError(404, 'Switch não encontrado');

  if (!withPorts) return sw;

  const ports = await portModel.findBySwitchId(id);
  return {
    ...sw,
    ports: ports.map((p) => ({
      ...p,
      display_color: getPortDisplayColor(p),
    })),
  };
}

async function create(payload) {
  const sw = await switchModel.create(payload);
  const count = payload.port_count || 24;
  for (let i = 1; i <= count; i++) {
    await portModel.create({ switch_id: sw.id, port_number: i, status: 'free' });
  }
  return getById(sw.id, true);
}

async function update(id, payload) {
  const sw = await switchModel.update(id, payload);
  if (!sw) throw new HttpError(404, 'Switch não encontrado');
  return sw;
}

async function remove(id) {
  const ok = await switchModel.remove(id);
  if (!ok) throw new HttpError(404, 'Switch não encontrado');
}

module.exports = { list, getById, create, update, remove };
