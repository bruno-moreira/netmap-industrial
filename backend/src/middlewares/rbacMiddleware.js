import { HttpError } from '../utils/HttpError.js';

// Define role permissions (simplified)
const rolePermissions = {
  root: ['read', 'create', 'update', 'delete'],
  admin: ['read', 'create', 'update', 'delete'],
  tecnico: ['read', 'create', 'update'],
  visualizador: ['read']
};

const authorize = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      const userRole = req.user.role_slug;
      const permissions = rolePermissions[userRole];

      if (!permissions) {
        throw new HttpError(403, 'Role de usuário inválida');
      }

      if (!permissions.includes(requiredPermission)) {
        throw new HttpError(403, 'Permissão negada');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new HttpError(401, 'Usuário não autenticado');
      }

      if (!allowedRoles.includes(req.user.role_slug)) {
        throw new HttpError(403, 'Permissão negada');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { authorize, hasRole };
