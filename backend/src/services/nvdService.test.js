import '../../test/setupEnv.js';
import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import nvdService from './nvdService.js';
import deviceModel from '../model/deviceModel.js';
import deviceTypeModel from '../model/deviceTypeModel.js';
import { HttpError } from '../utils/HttpError.js';

describe('nvdService', () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  it('discoverNvdCameras lança erro 400 se NVD não possui IP', async () => {
    mock.method(deviceModel, 'findById', async () => ({
      id: 1,
      name: 'NVD Sem IP',
      ip_address: null,
      metadata: {},
    }));

    await assert.rejects(
      () => nvdService.discoverNvdCameras(1, 1),
      (err) => err instanceof HttpError && err.statusCode === 400
    );
  });

  it('importNvdCameras importa câmeras e vincula ao NVD', async () => {
    mock.method(deviceModel, 'findById', async () => ({
      id: 10,
      name: 'NVD 7132 CPD',
      ip_address: '10.107.70.3',
      metadata: { camera_username: 'admin', camera_password: 'pass' },
    }));

    mock.method(deviceTypeModel, 'findBySlug', async () => ({
      id: 2,
      slug: 'camera',
      name: 'Câmera IP',
    }));

    const createdDevices = [];
    mock.method(deviceModel, 'create', async (data) => {
      const dev = { id: createdDevices.length + 100, ...data };
      createdDevices.push(dev);
      return dev;
    });

    const payload = [
      { channel: 1, name: 'VIPC Intelbras Portaria', ip_address: '10.107.71.21', mac_address: '' },
      { channel: 2, name: 'Externa Garagem', ip_address: '10.107.71.22', mac_address: 'AA:BB:CC:11:22:33' },
    ];

    const res = await nvdService.importNvdCameras(10, payload, 1, 1);

    assert.equal(res.imported_count, 2);
    assert.equal(createdDevices.length, 2);
    assert.equal(createdDevices[0].metadata.nvd_device_id, 10);
    assert.equal(createdDevices[0].metadata.nvd_channel, 1);
    assert.equal(createdDevices[0].location, 'Canal 1 - NVD 7132 CPD');
  });
});
