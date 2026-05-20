const portService = require('../services/portService');

async function getById(req, res) {
  const data = await portService.getById(Number(req.params.id));
  res.json(data);
}

async function update(req, res) {
  const data = await portService.update(Number(req.params.id), req.validated);
  res.json(data);
}

async function create(req, res) {
  const data = await portService.create(req.validated);
  res.status(201).json(data);
}

module.exports = { getById, update, create };
