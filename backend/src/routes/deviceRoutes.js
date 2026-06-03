const express = require('express');
const deviceController = require('../controllers/deviceController');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validateBody, validateQuery } = require('../middlewares/validateInput');
const { writeRateLimit } = require('../middlewares/rateLimit');
const {
  createDeviceSchema,
  updateDeviceSchema,
  searchQuerySchema,
} = require('../schemas');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', validateQuery(searchQuerySchema), asyncHandler(deviceController.list));
router.get('/:id(\\d+)', asyncHandler(deviceController.getById));
router.post('/', writeRateLimit, validateBody(createDeviceSchema), asyncHandler(deviceController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updateDeviceSchema), asyncHandler(deviceController.update));
router.delete('/:id(\\d+)', writeRateLimit, asyncHandler(deviceController.remove));

module.exports = router;
