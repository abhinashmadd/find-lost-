const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimiter");

// POST /api/auth/register
router.post(
  "/register",
  [
    check("name", "Name is required").notEmpty().trim(),
    check("email", "Please provide a valid email").isEmail(),
    check("password", "Password must be at least 8 characters").isLength({ min: 8 }),
  ],
  register
);

// POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  [
    check("email", "Please provide a valid email").isEmail(),
    check("password", "Password is required").notEmpty(),
  ],
  login
);

// GET /api/auth/me
router.get("/me", protect, getMe);

module.exports = router;
