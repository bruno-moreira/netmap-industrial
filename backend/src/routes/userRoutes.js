import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { hasRole } from '../middlewares/rbacMiddleware.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Lista usuários
 *     responses:
 *       200:
 *         description: Sucesso
 *   post:
 *     tags: [Users]
 *     summary: Cria usuário
 *     responses:
 *       201:
 *         description: Criado
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Busca usuário por ID
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
 *     tags: [Users]
 *     summary: Atualiza usuário
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
 *     tags: [Users]
 *     summary: Deleta usuário
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
router.use(hasRole('root'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
