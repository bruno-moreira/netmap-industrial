const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const roleRoutes = require('./roleRoutes');
const deviceRoutes = require('./deviceRoutes');
const switchRoutes = require('./switchRoutes');
const portRoutes = require('./portRoutes');
const vlanRoutes = require('./vlanRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const scanRoutes = require('./scanRoutes');
const deviceTypeRoutes = require('./deviceTypeRoutes');

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

module.exports = router;
