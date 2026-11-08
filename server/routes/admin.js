const express = require("express");
const router = express.Router();
const {
  getUsers,
  deactivateUser,
  activateUser,
  getAllItems,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

// All admin routes require valid token and admin role
router.use(protect, adminOnly);

// GET /api/admin/users - Get all users
router.get("/users", getUsers);

// PATCH /api/admin/users/:id/deactivate - Deactivate user
router.patch("/users/:id/deactivate", deactivateUser);

// PATCH /api/admin/users/:id/activate - Re-activate user
router.patch("/users/:id/activate", activateUser);

// GET /api/admin/items - Get all items regardless of status
router.get("/items", getAllItems);

module.exports = router;
