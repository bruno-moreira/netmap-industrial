const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { asyncHandler } = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(dashboardController.getStats));

module.exports = router;
