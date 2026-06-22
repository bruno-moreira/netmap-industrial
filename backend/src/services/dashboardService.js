import dashboardModel from '../model/dashboardModel.js';

async function getDashboard(tenantId) {
  return dashboardModel.getStats(tenantId);
}

export { getDashboard };
export default { getDashboard };
