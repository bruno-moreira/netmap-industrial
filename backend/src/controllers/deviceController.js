const deviceService = require('../services/deviceService');

async function list(req, res) {
  const data = await deviceService.list(req.validatedQuery || req.query, req.tenantId);
  res.json(data);
}

async function getById(req, res) {
  const data = await deviceService.getById(Number(req.params.id), req.tenantId);
  res.json(data);
}

async function create(req, res) {
  const data = await deviceService.create(req.validated, req.tenantId, req.user.id);
  res.status(201).json(data);
}

async function update(req, res) {
  const data = await deviceService.update(Number(req.params.id), req.validated, req.tenantId, req.user.id);
  res.json(data);
}

async function remove(req, res) {
  await deviceService.remove(Number(req.params.id), req.tenantId);
  res.status(204).send();
}

module.exports = { list, getById, create, update, remove };
