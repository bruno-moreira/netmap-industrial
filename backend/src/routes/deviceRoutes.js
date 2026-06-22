import express from 'express';
import deviceController from '../controllers/deviceController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateBody, validateQuery } from '../middlewares/validateInput.js';
import { writeRateLimit } from '../middlewares/rateLimit.js';
import {
  createDeviceSchema,
  updateDeviceSchema,
  searchQuerySchema,
} from '../schemas/index.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /devices:
 *   get:
 *     tags: [Devices]
 *     summary: Lista equipamentos conectados
 *     responses:
 *       200:
 *         description: Sucesso
 *   post:
 *     tags: [Devices]
 *     summary: Cria equipamento
 *     responses:
 *       201:
 *         description: Criado
 * /devices/{id}:
 *   get:
 *     tags: [Devices]
 *     summary: Detalhes do equipamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sucesso
 *   put:
 *     tags: [Devices]
 *     summary: Atualiza equipamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atualizado
 *   delete:
 *     tags: [Devices]
 *     summary: Deleta equipamento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Removido
 */

router.use(authenticateToken);

router.get('/', validateQuery(searchQuerySchema), asyncHandler(deviceController.list));
router.get('/:id(\\d+)', asyncHandler(deviceController.getById));
router.post('/', writeRateLimit, validateBody(createDeviceSchema), asyncHandler(deviceController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updateDeviceSchema), asyncHandler(deviceController.update));
router.delete('/:id(\\d+)', writeRateLimit, asyncHandler(deviceController.remove));

export default router;
