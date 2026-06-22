import switchService from '../services/switchService.js';

async function list(req, res) {
  const data = await switchService.list(req.tenantId);
  res.json(data);
}

async function getById(req, res) {
  const withPorts = req.query.ports === 'true';
  const data = await switchService.getById(Number(req.params.id), req.tenantId, withPorts);
  res.json(data);
}

async function create(req, res) {
  const data = await switchService.create(req.validated, req.tenantId, req.user.id);
  res.status(201).json(data);
}

async function update(req, res) {
  const data = await switchService.update(Number(req.params.id), req.validated, req.tenantId, req.user.id);
  res.json(data);
}

async function remove(req, res) {
  await switchService.remove(Number(req.params.id), req.tenantId);
  res.status(204).send();
}

export { list, getById, create, update, remove };
export default { list, getById, create, update, remove };
