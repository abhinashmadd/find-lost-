const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const AppError = require("../utils/appError");
const asyncHandler = require("../middleware/asyncHandler");

// POST /api/items/:id/claims (protect) - Submit an ownership claim for an item
exports.createClaim = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid item ID format", 400));
  }

  const { message, proofDetails } = req.body;
  if (!message || !proofDetails) {
    return next(new AppError("Message and proof details are required", 400));
  }

  const item = await Item.findById(req.params.id);
  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  if (item.status !== "open") {
    return next(new AppError("This item is not open for claims", 400));
  }

  // Rule: User cannot claim their own reported item
  if (item.reportedBy.toString() === req.user.id) {
    return next(new AppError("You cannot claim your own item", 400));
  }

  // Rule: Prevent duplicate pending claims from the same claimant
  const existingClaim = await Claim.findOne({
    item: item._id,
    claimant: req.user.id,
    status: "pending",
  });
  if (existingClaim) {
    return next(new AppError("You already have a pending claim on this item", 409));
  }

  const claim = await Claim.create({
    item: item._id,
    claimant: req.user.id,
    message: message.trim(),
    proofDetails: proofDetails.trim(),
    status: "pending",
  });

  return res.status(201).json(claim);
});

// GET /api/claims/mine (protect) - Get claims made by user and claims received on user's items
exports.getMyClaims = asyncHandler(async (req, res, next) => {
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
});

// PATCH /api/claims/:id (protect) - Approve or reject a claim
exports.decideClaim = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid claim ID format", 400));
  }

  const { decision } = req.body;
  if (!decision || !["approved", "rejected"].includes(decision)) {
    return next(new AppError("Decision must be either 'approved' or 'rejected'", 400));
  }

  const claim = await Claim.findById(req.params.id).populate("item");
  if (!claim) {
    return next(new AppError("Claim not found", 404));
  }

  // Rule: Only the reporter of the item can decide on the claim
  if (claim.item.reportedBy.toString() !== req.user.id) {
    return next(new AppError("Only the item reporter can decide on this claim", 403));
  }

  // Rule: Claim must currently be pending
  if (claim.status !== "pending") {
    return next(new AppError("This claim has already been decided", 400));
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
});

