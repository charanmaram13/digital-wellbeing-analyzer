import { NotFoundError } from '../utils/errors.js';

export function notFound(req, res, next) {
  next(new NotFoundError(`Cannot find endpoint [${req.method} ${req.originalUrl}] on this server`));
}

export default notFound;
