const deviceTypeModel = require('../model/deviceTypeModel');

async function list(req, res) {
  const data = await deviceTypeModel.findAll();
  res.json(data);
}

module.exports = { list };
