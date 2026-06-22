import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import roleRoutes from './roleRoutes.js';
import deviceRoutes from './deviceRoutes.js';
import switchRoutes from './switchRoutes.js';
import portRoutes from './portRoutes.js';
import vlanRoutes from './vlanRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import scanRoutes from './scanRoutes.js';
import deviceTypeRoutes from './deviceTypeRoutes.js';

const router = express.Router();

// Auth routes (public)
router.use('/auth', authRoutes);

// Protected routes below
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/switches', switchRoutes);
router.use('/ports', portRoutes);
router.use('/vlans', vlanRoutes);
router.use('/devices', deviceRoutes);
router.use('/device-types', deviceTypeRoutes);
router.use('/scan', scanRoutes);

export default router;
