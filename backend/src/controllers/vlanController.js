const vlanService = require('../services/vlanService');

async function list(req, res) {
  const data = await vlanService.list();
  res.json(data);
}

async function getById(req, res) {
  const data = await vlanService.getById(Number(req.params.id));
  res.json(data);
}

async function create(req, res) {
  const data = await vlanService.create(req.validated);
  res.status(201).json(data);
}

async function update(req, res) {
  const data = await vlanService.update(Number(req.params.id), req.validated);
  res.json(data);
}

async function remove(req, res) {
  await vlanService.remove(Number(req.params.id));
  res.status(204).send();
}

module.exports = { list, getById, create, update, remove };
