const switchService = require('../services/switchService');

async function list(req, res) {
  const data = await switchService.list();
  res.json(data);
}

async function getById(req, res) {
  const withPorts = req.query.ports === 'true';
  const data = await switchService.getById(Number(req.params.id), withPorts);
  res.json(data);
}

async function create(req, res) {
  const data = await switchService.create(req.validated);
  res.status(201).json(data);
}

async function update(req, res) {
  const data = await switchService.update(Number(req.params.id), req.validated);
  res.json(data);
}

async function remove(req, res) {
  await switchService.remove(Number(req.params.id));
  res.status(204).send();
}

module.exports = { list, getById, create, update, remove };
