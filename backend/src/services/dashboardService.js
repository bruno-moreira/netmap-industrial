const dashboardModel = require('../model/dashboardModel');

async function getDashboard(tenantId) {
  return dashboardModel.getStats(tenantId);
}

module.exports = { getDashboard };
