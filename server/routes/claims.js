const express = require("express");
const router = express.Router();
const { getMyClaims, decideClaim } = require("../controllers/claimController");
const { protect } = require("../middleware/auth");

// GET /api/claims/mine - Claims made and received by logged-in user
router.get("/mine", protect, getMyClaims);

// PATCH /api/claims/:id - Approve or reject claim (item owner only)
router.patch("/:id", protect, decideClaim);

module.exports = router;
