/**
 * A typed application error carrying an HTTP status code. Throwing these from
 * anywhere in the request lifecycle lets a single error-handling middleware
 * translate them into clean, consistent JSON responses.
 */
export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message) {
    return new ApiError(401, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static notFound(message) {
    return new ApiError(404, message);
  }

  static rateLimited(message, details) {
    return new ApiError(429, message, details);
  }

  static badGateway(message) {
    return new ApiError(502, message);
  }
}
