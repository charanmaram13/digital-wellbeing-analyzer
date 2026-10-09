import env from '../config/env.js';
import logger from '../utils/logger.js';
import ApiResponse from '../utils/apiResponse.js';

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected internal server error occurred';
  const details = err.details || null;

  if (statusCode >= 500) {
    logger.error(`Unhandled Error [${req.method} ${req.originalUrl}]:`, {
      message: err.message,
      stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  const payloadDetails = details || (env.NODE_ENV === 'development' && statusCode >= 500 ? err.stack : undefined);

  return ApiResponse.error(res, statusCode, message, code, payloadDetails);
}

export default errorHandler;
