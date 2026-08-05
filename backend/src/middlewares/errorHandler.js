import { HttpError } from '../utils/HttpError.js';
import { logger } from '../config/logger.js';

function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const isKnownError = err instanceof HttpError || (status >= 400 && status < 500);

  if (status >= 500 && !(err instanceof HttpError)) {
    logger.error({ err, path: req.path, method: req.method }, 'Erro interno');
  }

  const message = isKnownError ? err.message : 'Erro interno do servidor';

  res.status(status).json({
    error: message,
    message,
    ...(err.details && { details: err.details }),
  });
}

export { errorHandler, HttpError };
