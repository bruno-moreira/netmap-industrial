import express from 'express';
import scanController from '../controllers/scanController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { writeRateLimit } from '../middlewares/rateLimit.js';

import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/network', writeRateLimit, asyncHandler(scanController.scanNetwork));
router.post('/switch/:id(\\d+)', writeRateLimit, asyncHandler(scanController.scanSwitch));

export default router;
