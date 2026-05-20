const express = require('express');
const vlanController = require('../controllers/vlanController');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validateBody } = require('../middlewares/validateInput');
const { writeRateLimit } = require('../middlewares/rateLimit');
const { createVlanSchema } = require('../schemas');

const router = express.Router();

router.get('/', asyncHandler(vlanController.list));
router.post('/', writeRateLimit, validateBody(createVlanSchema), asyncHandler(vlanController.create));

module.exports = router;
