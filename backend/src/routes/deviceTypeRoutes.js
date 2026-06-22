import express from 'express';
import deviceTypeController from '../controllers/deviceTypeController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(deviceTypeController.list));

export default router;
