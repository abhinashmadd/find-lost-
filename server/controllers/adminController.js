const mongoose = require("mongoose");
const User = require("../models/User");
const Item = require("../models/Item");

// GET /api/admin/users - List all users (excluding password hashes)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching users" });
  }
};

// PATCH /api/admin/users/:id/deactivate - Deactivate a user account
exports.deactivateUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Rule: Admins cannot deactivate their own account
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Admins cannot deactivate their own account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Rule: Admins cannot deactivate another admin account
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot deactivate an administrator account" });
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
  } catch (error) {
    return res.status(500).json({ message: "Server error deactivating user" });
  }
};

// PATCH /api/admin/users/:id/activate - Re-activate a deactivated user account
exports.activateUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
  } catch (error) {
    return res.status(500).json({ message: "Server error activating user" });
  }
};

// GET /api/admin/items - List all items across all statuses
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    return res.status(200).json(items);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching admin items" });
  }
};

