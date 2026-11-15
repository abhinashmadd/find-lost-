const mongoose = require("mongoose");
const User = require("../models/User");
const Item = require("../models/Item");
const AppError = require("../utils/appError");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/admin/users - List all users (excluding password hashes)
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
  return res.status(200).json(users);
});

// PATCH /api/admin/users/:id/deactivate - Deactivate a user account
exports.deactivateUser = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid user ID format", 400));
  }

  // Rule: Admins cannot deactivate their own account
  if (req.params.id === req.user.id) {
    return next(new AppError("Admins cannot deactivate their own account", 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Rule: Admins cannot deactivate another admin account
  if (user.role === "admin") {
    return next(new AppError("Cannot deactivate an administrator account", 400));
  }

  user.isActive = false;
  await user.save();

  return res.status(200).json({
    message: "User deactivated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
  });
});

// PATCH /api/admin/users/:id/activate - Re-activate a deactivated user account
exports.activateUser = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid user ID format", 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isActive = true;
  await user.save();

  return res.status(200).json({
    message: "User activated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
    },
  });
});

// GET /api/admin/items - List all items across all statuses
exports.getAllItems = asyncHandler(async (req, res, next) => {
  const items = await Item.find()
    .populate("reportedBy", "name email")
    .sort({ createdAt: -1 });
  return res.status(200).json(items);
});

