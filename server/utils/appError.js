/**
 * Custom Operational Application Error.
 * Differentiates expected operational failures (e.g. 400 Bad Request, 404 Not Found)
 * from unexpected programming defects (500 Internal Server Error).
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
