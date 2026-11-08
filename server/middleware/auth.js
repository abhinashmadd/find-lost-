const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes: verifies JWT and ensures account is active
exports.protect = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Not authorised, no token provided" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "supersecretjwtkeyforcollegeproject2026";
    const decoded = jwt.verify(token, jwtSecret);

    // Confirm that the user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User belonging to this token no longer exists" });
    }

    // Confirm that the account is not deactivated (only block when explicitly false)
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }

    // Attach user identity to request object
    req.user = {
      id: user._id.toString ? user._id.toString() : String(user._id),
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

// Middleware to restrict access to admin users only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access required" });
  }
};
