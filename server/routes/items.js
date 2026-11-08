const express = require("express");
const router = express.Router();
const {
  listItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { createClaim } = require("../controllers/claimController");
const { protect } = require("../middleware/auth");
const uploadSingle = require("../middleware/upload");

// GET /api/items - Browse & filter items (public)
router.get("/", listItems);

// GET /api/items/:id - View single item (public)
router.get("/:id", getItemById);

// POST /api/items - Report a lost or found item with optional photo (protected)
router.post("/", protect, uploadSingle, createItem);

// PUT /api/items/:id - Update item report (owner only)
router.put("/:id", protect, updateItem);

// DELETE /api/items/:id - Delete item report (owner or admin)
router.delete("/:id", protect, deleteItem);

// POST /api/items/:id/claims - Submit claim for an item (protected)
router.post("/:id/claims", protect, createClaim);

module.exports = router;
