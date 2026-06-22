import express from 'express';
import portController from '../controllers/portController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateBody } from '../middlewares/validateInput.js';
import { writeRateLimit } from '../middlewares/rateLimit.js';
import { updatePortSchema, createPortSchema } from '../schemas/index.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /ports:
 *   post:
 *     tags: [Ports]
 *     summary: Cria uma porta
 *     responses:
 *       201:
 *         description: Criado
 * /ports/{id}:
 *   get:
 *     tags: [Ports]
 *     summary: Busca porta
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
 *     tags: [Ports]
 *     summary: Atualiza porta (VLAN, Status, Trunk)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Atualizado
 */

router.use(authenticateToken);

router.get('/:id(\\d+)', asyncHandler(portController.getById));
router.post('/', writeRateLimit, validateBody(createPortSchema), asyncHandler(portController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updatePortSchema), asyncHandler(portController.update));

export default router;
