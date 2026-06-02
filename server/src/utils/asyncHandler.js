/**
 * Wraps an async route handler so any rejected promise is forwarded to
 * Express's error-handling middleware instead of leaving the request hanging.
 * Saves a try/catch in every controller.
 */
export const asyncHandler = (handler) => (req, res, next) => {
  handler(req, res, next).catch(next);
};
