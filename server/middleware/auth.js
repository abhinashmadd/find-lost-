const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");

// Middleware to protect routes: verifies JWT and ensures account is active
exports.protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError("Not authorised, no token provided", 401));
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkeyforcollegeproject2026";
    const decoded = jwt.verify(token, jwtSecret);

    // Confirm that the user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError("User belonging to this token no longer exists", 401));
    }

    // Confirm that the account is not deactivated (only block when explicitly false)
    if (user.isActive === false) {
      return next(new AppError("Account has been deactivated", 403));
    }

    // Attach user identity to request object
    req.user = {
      id: user._id.toString ? user._id.toString() : String(user._id),
      role: user.role,
    };
    next();
  } catch (error) {
    return next(new AppError("Token invalid or expired", 401));
  }
};

// Middleware to restrict access to admin users only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return next(new AppError("Admin access required", 403));
  }
};
