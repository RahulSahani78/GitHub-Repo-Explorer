import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/** Catch-all for unmatched routes -> consistent 404 JSON. */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}

/**
 * Central error handler. Every thrown ApiError becomes a clean JSON envelope
 * of the shape `{ error: { message, ...details } }`. Unexpected errors are
 * logged and returned as a generic 500 so we never leak stack traces to clients.
 */
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity (4 args).
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: { message: err.message, ...(err.details ?? {}) },
    });
    return;
  }

  if (!env.isProduction) console.error('[unhandled error]', err);
  res.status(500).json({
    error: { message: 'Something went wrong on our end. Please try again.' },
  });
}
