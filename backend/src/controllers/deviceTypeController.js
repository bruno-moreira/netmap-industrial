import deviceTypeModel from '../model/deviceTypeModel.js';

async function list(req, res) {
  const data = await deviceTypeModel.findAll();
  res.json(data);
}

export { list };
export default { list };
