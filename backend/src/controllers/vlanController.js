const vlanService = require('../services/vlanService');

async function list(req, res) {
  const data = await vlanService.list();
  res.json(data);
}

async function create(req, res) {
  const data = await vlanService.create(req.validated);
  res.status(201).json(data);
}

module.exports = { list, create };
