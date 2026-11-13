const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Register a new user
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { name, email, password, phone } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
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
  } catch (error) {
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// Log in an existing user
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Same generic error for unknown email AND wrong password to prevent user enumeration
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Block only users who are explicitly deactivated (strict check)
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account has been deactivated" });
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
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// Get profile of current logged-in user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObj = user.toObject ? user.toObject() : { ...user };
    userObj.id = userObj._id;

    return res.status(200).json(userObj);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching user profile" });
  }
};
