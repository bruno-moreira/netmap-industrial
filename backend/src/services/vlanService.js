const vlanModel = require('../model/vlanModel');
const { HttpError } = require('../utils/HttpError');

async function list() {
  return vlanModel.findAll();
}

async function create(payload) {
  try {
    return await vlanModel.create(payload);
  } catch (err) {
    if (err.code === '23505') throw new HttpError(409, 'Número de VLAN já cadastrado');
    throw err;
  }
}

module.exports = { list, create };
