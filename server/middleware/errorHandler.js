const AppError = require("../utils/appError");

/**
 * Handle Mongoose invalid ObjectId CastError.
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key errors (E11000).
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "field";
  const value = err.keyValue ? err.keyValue[field] : "";
  const message = `Duplicate value '${value}' for ${field}. Please use another value.`;
  return new AppError(message, 409);
};

/**
 * Handle Mongoose schema validation errors.
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  const message = `Validation failed: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT signature errors.
 */
const handleJWTError = () =>
  new AppError("Invalid security token. Please log in again.", 401);

/**
 * Handle JWT expired errors.
 */
const handleJWTExpiredError = () =>
  new AppError("Security token has expired. Please log in again.", 401);

/**
 * Handle Multer file upload errors.
 */
const handleMulterError = (err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new AppError("File size exceeds 2 MB limit", 400);
  }
  return new AppError(err.message || "File upload failed", 400);
};

/**
 * Send detailed error response in development environment.
 */
const sendErrorDev = (err, res) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    status: err.status || "error",
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/**
 * Send clean, sanitized error response in production environment.
 */
const sendErrorProd = (err, res) => {
  const statusCode = err.statusCode || 500;

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Programming or unknown external error: log internally and send generic response
  console.error("CRITICAL UNHANDLED ERROR 💥:", err);
  return res.status(500).json({
    success: false,
    message: "An internal server error occurred. Please try again later.",
  });
};

/**
 * Centralized Express Error Handling Middleware.
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

  if (isDev) {
    sendErrorDev(err, res);
  } else {
    let error = Object.assign(err);
    error.message = err.message;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.name === "MulterError") error = handleMulterError(error);

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
