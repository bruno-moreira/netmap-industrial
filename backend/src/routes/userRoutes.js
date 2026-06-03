const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { hasRole } = require('../middlewares/rbacMiddleware');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken);
router.use(hasRole('root'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
