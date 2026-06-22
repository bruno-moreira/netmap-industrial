import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import roleModel from '../model/roleModel.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', asyncHandler(async (req, res) => {
  const roles = await roleModel.findAll();
  res.json(roles);
}));

export default router;
