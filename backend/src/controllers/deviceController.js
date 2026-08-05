import deviceService from '../services/deviceService.js';

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

async function fetchSnapshotPreview(req, res) {
  const data = await deviceService.fetchSnapshotPreview(req.validated || req.body);
  res.json(data);
}

async function fetchDeviceSnapshot(req, res) {
  const data = await deviceService.fetchDeviceSnapshot(Number(req.params.id), req.tenantId, req.user.id);
  res.json(data);
}

async function discoverNvdCameras(req, res) {
  const data = await deviceService.discoverNvdCameras(Number(req.params.id), req.tenantId);
  res.json(data);
}

async function importNvdCameras(req, res) {
  const cameras = req.body.cameras || req.body;
  const data = await deviceService.importNvdCameras(Number(req.params.id), cameras, req.tenantId, req.user.id);
  res.status(201).json(data);
}

export {
  list,
  getById,
  create,
  update,
  remove,
  fetchSnapshotPreview,
  fetchDeviceSnapshot,
  discoverNvdCameras,
  importNvdCameras,
};

export default {
  list,
  getById,
  create,
  update,
  remove,
  fetchSnapshotPreview,
  fetchDeviceSnapshot,
  discoverNvdCameras,
  importNvdCameras,
};
