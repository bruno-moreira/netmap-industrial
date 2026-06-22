import express from 'express';
import vlanController from '../controllers/vlanController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateBody } from '../middlewares/validateInput.js';
import { writeRateLimit } from '../middlewares/rateLimit.js';
import { createVlanSchema, updateVlanSchema } from '../schemas/index.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /vlans:
 *   get:
 *     tags: [VLANs]
 *     summary: Lista VLANs
 *     responses:
 *       200:
 *         description: Sucesso
 *   post:
 *     tags: [VLANs]
 *     summary: Cria VLAN
 *     responses:
 *       201:
 *         description: Criado
 * /vlans/{id}:
 *   get:
 *     tags: [VLANs]
 *     summary: Busca VLAN por ID
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
 *     tags: [VLANs]
 *     summary: Atualiza VLAN
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
 *     tags: [VLANs]
 *     summary: Deleta VLAN
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

router.get('/', asyncHandler(vlanController.list));
router.get('/:id(\\d+)', asyncHandler(vlanController.getById));
router.post('/', writeRateLimit, validateBody(createVlanSchema), asyncHandler(vlanController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updateVlanSchema), asyncHandler(vlanController.update));
router.delete('/:id(\\d+)', writeRateLimit, asyncHandler(vlanController.remove));

export default router;
