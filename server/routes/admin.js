const express = require("express");
const router = express.Router();
const {
  getUsers,
  deactivateUser,
  activateUser,
  getAllItems,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");
const { validateMongoId } = require("../validators");

// All admin routes require valid token and admin role
router.use(protect, adminOnly);

// GET /api/admin/users - Get all users
router.get("/users", getUsers);

// PATCH /api/admin/users/:id/deactivate - Deactivate user
router.patch("/users/:id/deactivate", validateMongoId("id", "user ID"), deactivateUser);

// PATCH /api/admin/users/:id/activate - Re-activate user
router.patch("/users/:id/activate", validateMongoId("id", "user ID"), activateUser);

// GET /api/admin/items - Get all items regardless of status
router.get("/items", getAllItems);

module.exports = router;
