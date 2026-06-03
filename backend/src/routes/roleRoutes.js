const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const roleModel = require('../model/roleModel');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(async (req, res) => {
  const roles = await roleModel.findAll();
  res.json(roles);
}));

module.exports = router;
