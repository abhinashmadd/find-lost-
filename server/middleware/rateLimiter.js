const rateLimit = require("express-rate-limit");
const config = require("../config/env");

// General API rate limiter: configurable requests per window per IP
exports.apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.apiMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again after 15 minutes" },
});

// Stricter login rate limiter to protect against brute-force attacks
exports.loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.loginMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again after 15 minutes" },
});

