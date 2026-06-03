const jwt = require('jsonwebtoken');
const { HttpError } = require('../utils/HttpError');
const userModel = require('../model/userModel');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new HttpError(401, 'Token de autenticação não fornecido');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    const user = await userModel.findById(decoded.userId);

    if (!user || !user.is_active) {
      throw new HttpError(401, 'Usuário não encontrado ou inativo');
    }

    req.user = user;
    req.tenantId = user.tenant_id;
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
    } else if (error.name === 'JsonWebTokenError') {
      next(new HttpError(401, 'Token inválido'));
    } else if (error.name === 'TokenExpiredError') {
      next(new HttpError(401, 'Token expirado'));
    } else {
      next(new HttpError(500, 'Erro interno do servidor'));
    }
  }
};

module.exports = { authenticateToken };
