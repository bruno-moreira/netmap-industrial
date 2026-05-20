const { HttpError } = require('../utils/HttpError');
const { logger } = require('../config/logger');

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

module.exports = { errorHandler, HttpError };
