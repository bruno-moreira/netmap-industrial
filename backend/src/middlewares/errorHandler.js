import { HttpError } from '../utils/HttpError.js';
import { logger } from '../config/logger.js';

function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const isClient = status >= 400 && status < 500;

  if (!isClient) {
    logger.error({ err, path: req.path, method: req.method }, 'Erro interno');
  }

  res.status(status).json({
    error: isClient ? err.message : 'Erro interno do servidor',
    ...(err.details && { details: err.details }),
  });
}

export { errorHandler, HttpError };
