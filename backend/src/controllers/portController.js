import portService from '../services/portService.js';

async function getById(req, res) {
  const data = await portService.getById(Number(req.params.id), req.tenantId);
  res.json(data);
}

async function update(req, res) {
  const data = await portService.update(Number(req.params.id), req.validated, req.tenantId, req.user.id);
  res.json(data);
}

async function create(req, res) {
  const data = await portService.create(req.validated, req.tenantId, req.user.id);
  res.status(201).json(data);
}

export { getById, update, create };
export default { getById, update, create };
