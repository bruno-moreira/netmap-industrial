const express = require('express');
const deviceTypeController = require('../controllers/deviceTypeController');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(deviceTypeController.list));

module.exports = router;
