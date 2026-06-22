import dashboardService from '../services/dashboardService.js';

async function getStats(req, res) {
  const data = await dashboardService.getDashboard(req.tenantId);
  res.json(data);
}

export { getStats };
export default { getStats };
