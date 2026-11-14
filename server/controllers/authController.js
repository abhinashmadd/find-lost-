const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncHandler = require("../middleware/asyncHandler");

// Register a new user
exports.register = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { name, email, password, phone } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new AppError("Email already registered", 409));
  }

  // Hash the password with bcrypt (salt cost 10)
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    phone: phone ? phone.trim() : "",
    isActive: true,
  });

  // Return created user without password hash
  return res.status(201).json({
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
  });
});

// Log in an existing user
exports.login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }

  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  // Same generic error for unknown email AND wrong password to prevent user enumeration
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Block only users who are explicitly deactivated (strict check)
  if (user.isActive === false) {
    return next(new AppError("Account has been deactivated", 403));
  }

  // Create JWT token valid for 7 days
  const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkeyforcollegeproject2026";
  const token = jwt.sign(
    { id: user._id, role: user.role },
    jwtSecret,
    { expiresIn: "7d" }
  );

  return res.status(200).json({
    token,
    user: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
    },
  });
});

// Get profile of current logged-in user
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const userObj = user.toObject ? user.toObject() : { ...user };
  userObj.id = userObj._id;

  return res.status(200).json(userObj);
});
