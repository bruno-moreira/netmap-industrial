import scanService from '../services/scanService.js';

async function scanNetwork(req, res) {
  const data = await scanService.scanNetwork();
  res.json(data);
}

async function scanSwitch(req, res) {
  const switchId = Number(req.params.id);
  const applyToDb = req.body?.applyToDb === true;
  const tenantId = req.tenantId || req.user.tenant_id;
  const userId = req.user.id;
  const data = await scanService.scanSwitch(switchId, tenantId, applyToDb, userId);
  res.json(data);
}

export { scanNetwork, scanSwitch };
export default { scanNetwork, scanSwitch };
