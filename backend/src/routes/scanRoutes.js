const express = require('express');
const scanController = require('../controllers/scanController');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { writeRateLimit } = require('../middlewares/rateLimit');

const router = express.Router();

router.post('/network', writeRateLimit, asyncHandler(scanController.scanNetwork));
router.post('/switch/:id(\\d+)', writeRateLimit, asyncHandler(scanController.scanSwitch));

module.exports = router;
