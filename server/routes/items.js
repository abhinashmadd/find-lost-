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
const {
  createItemRules,
  updateItemRules,
  createClaimRules,
  validateMongoId,
} = require("../validators");

// GET /api/items - Browse & filter items (public)
router.get("/", listItems);

// GET /api/items/:id - View single item (public)
router.get("/:id", validateMongoId("id", "item ID"), getItemById);

// POST /api/items - Report a lost or found item with optional photo (protected)
router.post("/", protect, uploadSingle, createItemRules, createItem);

// PUT /api/items/:id - Update item report (owner only)
router.put("/:id", protect, validateMongoId("id", "item ID"), updateItemRules, updateItem);

// DELETE /api/items/:id - Delete item report (owner or admin)
router.delete("/:id", protect, validateMongoId("id", "item ID"), deleteItem);

// POST /api/items/:id/claims - Submit claim for an item (protected)
router.post("/:id/claims", protect, validateMongoId("id", "item ID"), createClaimRules, createClaim);

module.exports = router;
