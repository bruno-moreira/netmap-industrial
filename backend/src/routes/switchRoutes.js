import express from 'express';
import switchController from '../controllers/switchController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateBody } from '../middlewares/validateInput.js';
import { writeRateLimit } from '../middlewares/rateLimit.js';
import { createSwitchSchema, updateSwitchSchema } from '../schemas/index.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /switches:
 *   get:
 *     tags: [Switches]
 *     summary: Lista todos os switches
 *     responses:
 *       200:
 *         description: Sucesso
 *   post:
 *     tags: [Switches]
 *     summary: Cria um novo switch
 *     responses:
 *       201:
 *         description: Criado
 * 
 * /switches/{id}:
 *   get:
 *     tags: [Switches]
 *     summary: Detalhes de um switch
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
 *     tags: [Switches]
 *     summary: Atualiza switch
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
 *     tags: [Switches]
 *     summary: Deleta switch
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

router.get('/', asyncHandler(switchController.list));
router.get('/:id(\\d+)', asyncHandler(switchController.getById));
router.post('/', writeRateLimit, validateBody(createSwitchSchema), asyncHandler(switchController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updateSwitchSchema), asyncHandler(switchController.update));
router.delete('/:id(\\d+)', writeRateLimit, asyncHandler(switchController.remove));

export default router;
