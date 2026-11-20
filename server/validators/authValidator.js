const { check } = require("express-validator");
const validate = require("./validate");

/**
 * Validation rules for user registration.
 */
const registerRules = [
  check("name", "Name is required").notEmpty().trim(),
  check("email", "Please provide a valid email").isEmail(),
  check("password", "Password must be at least 8 characters").isLength({ min: 8 }),
  validate,
];

/**
 * Validation rules for user login.
 */
const loginRules = [
  check("email", "Please provide a valid email").isEmail(),
  check("password", "Password is required").notEmpty(),
  validate,
];

module.exports = {
  registerRules,
  loginRules,
};
