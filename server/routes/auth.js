const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimiter");
const { registerRules, loginRules } = require("../validators");

// POST /api/auth/register - Register a new user account
router.post("/register", registerRules, register);

// POST /api/auth/login - Authenticate existing user and return JWT
router.post("/login", loginLimiter, loginRules, login);

// GET /api/auth/me - Retrieve current logged-in user profile
router.get("/me", protect, getMe);

module.exports = router;
