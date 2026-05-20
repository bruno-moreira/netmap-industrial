const dashboardService = require('../services/dashboardService');

async function getStats(req, res) {
  const data = await dashboardService.getDashboard();
  res.json(data);
}

module.exports = { getStats };
