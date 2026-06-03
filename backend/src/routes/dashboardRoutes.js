const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(dashboardController.getStats));

module.exports = router;
