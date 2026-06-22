import vlanService from '../services/vlanService.js';

async function list(req, res) {
  const data = await vlanService.list(req.tenantId);
  res.json(data);
}

async function getById(req, res) {
  const data = await vlanService.getById(Number(req.params.id), req.tenantId);
  res.json(data);
}

async function create(req, res) {
  const data = await vlanService.create(req.validated, req.tenantId, req.user.id);
  res.status(201).json(data);
}

async function update(req, res) {
  const data = await vlanService.update(Number(req.params.id), req.validated, req.tenantId, req.user.id);
  res.json(data);
}

async function remove(req, res) {
  await vlanService.remove(Number(req.params.id), req.tenantId);
  res.status(204).send();
}

export { list, getById, create, update, remove };
export default { list, getById, create, update, remove };
