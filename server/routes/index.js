const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const itemRoutes = require("./items");
const claimRoutes = require("./claims");
const adminRoutes = require("./admin");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// Mount domain resource routers
router.use("/auth", authRoutes);
router.use("/items", itemRoutes);
router.use("/claims", claimRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
