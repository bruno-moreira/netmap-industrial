import deviceModel from '../model/deviceModel.js';
import deviceTypeModel from '../model/deviceTypeModel.js';
import snapshotService from './snapshotService.js';
import nvdService from './nvdService.js';
import { HttpError } from '../utils/HttpError.js';
import { isValidMac, normalizeMac } from '../utils/networkValidators.js';

async function list(filters, tenantId) {
  return deviceModel.findAll(filters, tenantId);
}

async function getById(id, tenantId) {
  const device = await deviceModel.findById(id, tenantId);
  if (!device) throw new HttpError(404, 'Equipamento não encontrado');
  return device;
}

async function create(payload, tenantId, userId) {
  const type = await deviceTypeModel.findById(payload.device_type_id);
  if (!type) throw new HttpError(400, 'Tipo de equipamento inválido');

  if (payload.mac_address && !isValidMac(payload.mac_address)) {
    throw new HttpError(400, 'MAC Address inválido');
  }

  const data = { ...payload };
  if (data.mac_address) data.mac_address = normalizeMac(data.mac_address);

  try {
    return await deviceModel.create(data, tenantId, userId);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'IP ou identificador já cadastrado');
    throw err;
  }
}

async function update(id, payload, tenantId, userId) {
  await getById(id, tenantId);

  if (payload.device_type_id) {
    const type = await deviceTypeModel.findById(payload.device_type_id);
    if (!type) throw new HttpError(400, 'Tipo de equipamento inválido');
  }

  if (payload.mac_address && !isValidMac(payload.mac_address)) {
    throw new HttpError(400, 'MAC Address inválido');
  }

  const data = { ...payload };
  if (data.mac_address) data.mac_address = normalizeMac(data.mac_address);

  try {
    return await deviceModel.update(id, data, tenantId, userId);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'IP ou identificador já cadastrado');
    throw err;
  }
}

async function remove(id, tenantId) {
  const ok = await deviceModel.remove(id, tenantId);
  if (!ok) throw new HttpError(404, 'Equipamento não encontrado');
}

async function fetchSnapshotPreview(payload) {
  const image_data_uri = await snapshotService.fetchCameraSnapshot(payload);
  return { image_data_uri };
}

async function fetchDeviceSnapshot(id, tenantId, userId) {
  const device = await getById(id, tenantId);
  const metadata = device.metadata || {};
  const imageDataUri = await snapshotService.fetchCameraSnapshot({
    ip_address: device.ip_address,
    snapshot_url: metadata.snapshot_url,
    camera_username: metadata.camera_username,
    camera_password: metadata.camera_password,
  });

  const updatedMetadata = {
    ...metadata,
    image_url: imageDataUri,
    last_snapshot_at: new Date().toISOString(),
  };

  return await deviceModel.update(id, { metadata: updatedMetadata }, tenantId, userId);
}

async function discoverNvdCameras(id, tenantId) {
  return await nvdService.discoverNvdCameras(id, tenantId);
}

async function importNvdCameras(id, camerasPayload, tenantId, userId) {
  return await nvdService.importNvdCameras(id, camerasPayload, tenantId, userId);
}

export { list, getById, create, update, remove, fetchSnapshotPreview, fetchDeviceSnapshot, discoverNvdCameras, importNvdCameras };
export default { list, getById, create, update, remove, fetchSnapshotPreview, fetchDeviceSnapshot, discoverNvdCameras, importNvdCameras };
