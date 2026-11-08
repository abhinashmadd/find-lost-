const mongoose = require("mongoose");
const Item = require("../models/Item");

// GET /api/items (public) - List and filter items with pagination
exports.listItems = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching items" });
  }
};

// GET /api/items/:id (public) - Get single item details
exports.getItemById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const item = await Item.findById(req.params.id).populate("reportedBy", "name");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching item details" });
  }
};

// POST /api/items (protect, with image upload) - Create a new item report
exports.createItem = async (req, res) => {
  try {
    const { type, title, description, category, location, dateOfEvent } = req.body;

    if (!type || !title || !description || !category || !location || !dateOfEvent) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    if (!["lost", "found"].includes(type)) {
      return res.status(400).json({ message: "Type must be either 'lost' or 'found'" });
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
  } catch (error) {
    return res.status(500).json({ message: "Server error creating item report" });
  }
};

// PUT /api/items/:id (protect) - Update item details (owner only)
exports.updateItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Authorization check: only the reporting user can update
    if (item.reportedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this item" });
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
  } catch (error) {
    return res.status(500).json({ message: "Server error updating item" });
  }
};

// DELETE /api/items/:id (protect) - Delete an item (owner or admin)
exports.deleteItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid item ID format" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const isOwner = item.reportedBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    // Only owner or admin can delete
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "You are not authorized to delete this item" });
    }

    await Item.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting item" });
  }
};

