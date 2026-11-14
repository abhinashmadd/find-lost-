/**
 * Higher-order utility function to wrap asynchronous Express route handlers.
 * Eliminates repetitive try/catch blocks and automatically propagates rejected
 * promises to Express's centralized error handling middleware.
 * 
 * @param {Function} fn - Async Express route handler (req, res, next)
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
