const express = require('express');
const portController = require('../controllers/portController');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validateBody } = require('../middlewares/validateInput');
const { writeRateLimit } = require('../middlewares/rateLimit');
const { updatePortSchema, createPortSchema } = require('../schemas');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/:id(\\d+)', asyncHandler(portController.getById));
router.post('/', writeRateLimit, validateBody(createPortSchema), asyncHandler(portController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updatePortSchema), asyncHandler(portController.update));

module.exports = router;
