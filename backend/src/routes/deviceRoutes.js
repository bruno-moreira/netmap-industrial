import express from 'express';
import deviceController from '../controllers/deviceController.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { validateBody, validateQuery } from '../middlewares/validateInput.js';
import { writeRateLimit } from '../middlewares/rateLimit.js';
import {
  createDeviceSchema,
  updateDeviceSchema,
  searchQuerySchema,
  snapshotPreviewSchema,
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
 * /devices/snapshot-preview:
 *   post:
 *     tags: [Devices]
 *     summary: Testar e obter preview de snapshot de câmera IP via HTTP
 *     responses:
 *       200:
 *         description: Imagem em base64 Data URI
 * /devices/{id}/snapshot:
 *   post:
 *     tags: [Devices]
 *     summary: Capturar snapshot ao vivo de câmera cadastrada
 *     responses:
 *       200:
 *         description: Equipamento atualizado com a foto
 * /devices/{id}/discover-nvd-cameras:
 *   post:
 *     tags: [Devices]
 *     summary: Descoberta automática de câmeras em gravador NVD Intelbras
 *     responses:
 *       200:
 *         description: Lista de câmeras e modelo detectado (NVD 7132, NVD 3332, etc.)
 * /devices/{id}/import-nvd-cameras:
 *   post:
 *     tags: [Devices]
 *     summary: Importar em lote câmeras descobertas no NVD
 *     responses:
 *       201:
 *         description: Câmeras criadas no inventário
 */

router.use(authenticateToken);

router.get('/', validateQuery(searchQuerySchema), asyncHandler(deviceController.list));
router.get('/:id(\\d+)', asyncHandler(deviceController.getById));
router.post('/', writeRateLimit, validateBody(createDeviceSchema), asyncHandler(deviceController.create));
router.put('/:id(\\d+)', writeRateLimit, validateBody(updateDeviceSchema), asyncHandler(deviceController.update));
router.delete('/:id(\\d+)', writeRateLimit, asyncHandler(deviceController.remove));

router.post('/snapshot-preview', validateBody(snapshotPreviewSchema), asyncHandler(deviceController.fetchSnapshotPreview));
router.post('/:id(\\d+)/snapshot', writeRateLimit, asyncHandler(deviceController.fetchDeviceSnapshot));

router.post('/:id(\\d+)/discover-nvd-cameras', asyncHandler(deviceController.discoverNvdCameras));
router.post('/:id(\\d+)/import-nvd-cameras', writeRateLimit, asyncHandler(deviceController.importNvdCameras));

export default router;
