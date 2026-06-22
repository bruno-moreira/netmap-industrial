import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Retorna estatísticas gerais
 *     responses:
 *       200:
 *         description: Estatísticas do sistema (total de switches, portas, dispositivos)
 */
router.use(authenticateToken);

router.get('/', asyncHandler(dashboardController.getStats));

export default router;
