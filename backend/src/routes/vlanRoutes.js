const express = require('express');
const vlanController = require('../controllers/vlanController');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { validateBody } = require('../middlewares/validateInput');
const { writeRateLimit } = require('../middlewares/rateLimit');
const { createVlanSchema, updateVlanSchema } = require('../schemas');

const router = express.Router();

router.get('/', asyncHandler(vlanController.list));
router.get('/:id(\\d+)', asyncHandler(vlanController.getById));
router.post('/', writeRateLimit, validateBody(createVlanSchema), asyncHandler(vlanController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updateVlanSchema), asyncHandler(vlanController.update));
router.delete('/:id(\\d+)', writeRateLimit, asyncHandler(vlanController.remove));

module.exports = router;
