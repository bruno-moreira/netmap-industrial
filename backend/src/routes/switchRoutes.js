const express = require('express');
const switchController = require('../controllers/switchController');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validateBody } = require('../middlewares/validateInput');
const { writeRateLimit } = require('../middlewares/rateLimit');
const { createSwitchSchema, updateSwitchSchema } = require('../schemas');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(switchController.list));
router.get('/:id(\\d+)', asyncHandler(switchController.getById));
router.post('/', writeRateLimit, validateBody(createSwitchSchema), asyncHandler(switchController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updateSwitchSchema), asyncHandler(switchController.update));
router.delete('/:id(\\d+)', writeRateLimit, asyncHandler(switchController.remove));

module.exports = router;
