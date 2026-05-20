const express = require('express');
const deviceTypeController = require('../controllers/deviceTypeController');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(deviceTypeController.list));

module.exports = router;
