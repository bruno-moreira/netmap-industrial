import scanService from '../services/scanService.js';

async function scanNetwork(req, res) {
  const data = await scanService.scanNetwork();
  res.json(data);
}

async function scanSwitch(req, res) {
  const data = await scanService.scanSwitch(Number(req.params.id));
  res.json(data);
}

export { scanNetwork, scanSwitch };
export default { scanNetwork, scanSwitch };
