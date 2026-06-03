const switchModel = require('../model/switchModel');
const portModel = require('../model/portModel');
const { HttpError } = require('../utils/HttpError');
const { getPortDisplayColor } = require('../utils/networkValidators');

async function list(tenantId) {
  return switchModel.findAll(tenantId);
}

async function getById(id, tenantId, withPorts = false) {
  const sw = await switchModel.findById(id, tenantId);
  if (!sw) throw new HttpError(404, 'Switch não encontrado');

  if (!withPorts) return sw;

  const ports = await portModel.findBySwitchId(id, tenantId);
  return {
    ...sw,
    ports: ports.map((p) => ({
      ...p,
      display_color: getPortDisplayColor(p),
    })),
  };
}

async function create(payload, tenantId, userId) {
  const sw = await switchModel.create(payload, tenantId, userId);
  const count = payload.port_count || 24;
  for (let i = 1; i <= count; i++) {
    await portModel.create({
      switch_id: sw.id,
      port_number: i,
      status: 'free',
    }, tenantId, userId);
  }
  return getById(sw.id, tenantId, true);
}

async function update(id, payload, tenantId, userId) {
  const sw = await switchModel.update(id, payload, tenantId, userId);
  if (!sw) throw new HttpError(404, 'Switch não encontrado');
  return sw;
}

async function remove(id, tenantId) {
  const ok = await switchModel.remove(id, tenantId);
  if (!ok) throw new HttpError(404, 'Switch não encontrado');
}

module.exports = { list, getById, create, update, remove };
