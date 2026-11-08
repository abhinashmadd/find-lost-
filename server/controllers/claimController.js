const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const Item = require("../models/Item");

// POST /api/items/:id/claims (protect) - Submit an ownership claim for an item
exports.createClaim = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const { message, proofDetails } = req.body;
    if (!message || !proofDetails) {
      return res.status(400).json({ message: "Message and proof details are required" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.status !== "open") {
      return res.status(400).json({ message: "This item is not open for claims" });
    }

    // Rule: User cannot claim their own reported item
    if (item.reportedBy.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot claim your own item" });
    }

    // Rule: Prevent duplicate pending claims from the same claimant
    const existingClaim = await Claim.findOne({
      item: item._id,
      claimant: req.user.id,
      status: "pending",
    });
    if (existingClaim) {
      return res.status(409).json({ message: "You already have a pending claim on this item" });
    }

    const claim = await Claim.create({
      item: item._id,
      claimant: req.user.id,
      message: message.trim(),
      proofDetails: proofDetails.trim(),
      status: "pending",
    });

    return res.status(201).json(claim);
  } catch (error) {
    return res.status(500).json({ message: "Server error creating claim" });
  }
};

// GET /api/claims/mine (protect) - Get claims made by user and claims received on user's items
exports.getMyClaims = async (req, res) => {
  try {
    // Claims submitted by the logged-in user
    const made = await Claim.find({ claimant: req.user.id })
      .populate("item")
      .sort({ createdAt: -1 });

    // Find all items reported by the logged-in user
    const myItems = await Item.find({ reportedBy: req.user.id }).select("_id");
    const myItemIds = myItems.map((item) => item._id);

    // Claims received on those items
    const rawReceived = await Claim.find({ item: { $in: myItemIds } })
      .populate("item")
      .populate("claimant", "name email phone")
      .sort({ createdAt: -1 });

    // Privacy rule: Only reveal email and phone if claim is approved
    const received = rawReceived.map((claim) => {
      const claimObj = claim.toObject ? claim.toObject() : { ...claim };
      if (claimObj.status !== "approved" && claimObj.claimant) {
        claimObj.claimant = { ...claimObj.claimant };
        delete claimObj.claimant.email;
        delete claimObj.claimant.phone;
      }
      return claimObj;
    });

    return res.status(200).json({ made, received });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching user claims" });
  }
};

// PATCH /api/claims/:id (protect) - Approve or reject a claim
exports.decideClaim = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid claim ID format" });
    }

    const { decision } = req.body;
    if (!decision || !["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be either 'approved' or 'rejected'" });
    }

    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    // Rule: Only the reporter of the item can decide on the claim
    if (claim.item.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the item reporter can decide on this claim" });
    }

    // Rule: Claim must currently be pending
    if (claim.status !== "pending") {
      return res.status(400).json({ message: "This claim has already been decided" });
    }

    claim.status = decision;
    await claim.save();

    // If approved, mark item as returned and reject all other pending claims on that item
    if (decision === "approved") {
      await Item.findByIdAndUpdate(claim.item._id, { status: "returned" });
      await Claim.updateMany(
        {
          item: claim.item._id,
          _id: { $ne: claim._id },
          status: "pending",
        },
        { status: "rejected" }
      );
    }

    return res.status(200).json(claim);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating claim decision" });
  }
};

