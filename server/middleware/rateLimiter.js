const rateLimit = require("express-rate-limit");

// General API rate limiter: max 100 requests per 15 minutes per IP
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again after 15 minutes" },
});

// Stricter login rate limiter to protect against brute-force attacks: max 5 attempts per 15 minutes
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again after 15 minutes" },
});

