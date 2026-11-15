const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const config = require("../config/env");

let storage;

if (config.cloudinary.isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "lost_and_found",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });
} else {
  // Local storage fallback for seamless offline/local development without Cloudinary
  const uploadDir = path.join(__dirname, "../public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `item-${uniqueSuffix}${ext}`);
    },
  });
}

// Validate file type
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpg, .jpeg, .png, and .webp images are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeBytes },
  fileFilter,
});

// Middleware wrapper to return clean JSON errors on invalid upload
const uploadSingle = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size exceeds 2 MB limit" });
      }
      return res.status(400).json({ message: err.message || "Invalid file upload" });
    }
    next();
  });
};

module.exports = uploadSingle;
