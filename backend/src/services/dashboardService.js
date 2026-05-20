const dashboardModel = require('../model/dashboardModel');

async function getDashboard() {
  return dashboardModel.getStats();
}

module.exports = { getDashboard };
