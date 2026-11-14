const mongoose = require("mongoose");
const Item = require("../models/Item");
const AppError = require("../utils/appError");
const asyncHandler = require("../middleware/asyncHandler");

// GET /api/items (public) - List and filter items with pagination
exports.listItems = asyncHandler(async (req, res, next) => {
  const { q, type, category, status = "open", page = 1, limit = 12 } = req.query;

  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (req.query.reportedBy) filter.reportedBy = req.query.reportedBy;
  if (q) filter.$text = { $search: q };

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const items = await Item.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate("reportedBy", "name");

  const total = await Item.countDocuments(filter);
  const pages = Math.ceil(total / limitNum) || 1;

  return res.status(200).json({
    items,
    total,
    page: pageNum,
    pages,
  });
});

// GET /api/items/:id (public) - Get single item details
exports.getItemById = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid item ID format", 400));
  }

  const item = await Item.findById(req.params.id).populate("reportedBy", "name");
  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  return res.status(200).json(item);
});

// POST /api/items (protect, with image upload) - Create a new item report
exports.createItem = asyncHandler(async (req, res, next) => {
  const { type, title, description, category, location, dateOfEvent } = req.body;

  if (!type || !title || !description || !category || !location || !dateOfEvent) {
    return next(new AppError("All required fields must be provided", 400));
  }

  if (!["lost", "found"].includes(type)) {
    return next(new AppError("Type must be either 'lost' or 'found'", 400));
  }

  // Image URL from Cloudinary (path starting with http) or local static fallback
  let imageUrl = "";
  if (req.file) {
    if (req.file.path && (req.file.path.startsWith("http://") || req.file.path.startsWith("https://"))) {
      imageUrl = req.file.path;
    } else if (req.file.filename) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }
  }

  const item = await Item.create({
    type,
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    location: location.trim(),
    dateOfEvent,
    imageUrl,
    status: "open",
    reportedBy: req.user.id,
  });

  return res.status(201).json(item);
});

// PUT /api/items/:id (protect) - Update item details (owner only)
exports.updateItem = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid item ID format", 400));
  }

  const item = await Item.findById(req.params.id);
  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  // Authorization check: only the reporting user can update
  if (item.reportedBy.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to update this item", 403));
  }

  const { type, title, description, category, location, dateOfEvent, status } = req.body;

  if (type && ["lost", "found"].includes(type)) item.type = type;
  if (title) item.title = title.trim();
  if (description) item.description = description.trim();
  if (category) item.category = category.trim();
  if (location) item.location = location.trim();
  if (dateOfEvent) item.dateOfEvent = dateOfEvent;
  if (status && ["open", "returned"].includes(status)) item.status = status;

  await item.save();

  return res.status(200).json(item);
});

// DELETE /api/items/:id (protect) - Delete an item (owner or admin)
exports.deleteItem = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError("Invalid item ID format", 400));
  }

  const item = await Item.findById(req.params.id);
  if (!item) {
    return next(new AppError("Item not found", 404));
  }

  const isOwner = item.reportedBy.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";

  // Only owner or admin can delete
  if (!isOwner && !isAdmin) {
    return next(new AppError("You are not authorized to delete this item", 403));
  }

  await Item.findByIdAndDelete(req.params.id);

  return res.status(200).json({ message: "Item deleted successfully" });
});

