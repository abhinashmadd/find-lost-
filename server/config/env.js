const path = require("path");

// Load environment variables from server/.env, falling back to root .env
require("dotenv").config({ path: path.join(__dirname, "../.env") });
if (!process.env.JWT_SECRET && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
}

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";
const isDevelopment = env === "development" || !process.env.NODE_ENV;

const defaultJwtSecret = "supersecretjwtkeyforcollegeproject2026";
const jwtSecret = process.env.JWT_SECRET || defaultJwtSecret;

// Security audit warning if default secret is used in production
if (isProduction && jwtSecret === defaultJwtSecret) {
  console.warn("⚠️ SECURITY WARNING: Using fallback JWT_SECRET in production. Set a unique secret in environment variables!");
}

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "demo" &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== "123456789"
);

const config = Object.freeze({
  env,
  isProduction,
  isDevelopment,
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  database: {
    uri: process.env.MONGODB_URI || "local",
    useLocal: process.env.USE_LOCAL_DB === "true" || process.env.MONGODB_URI === "local",
  },
  jwt: {
    secret: jwtSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  cloudinary: {
    isConfigured: hasCloudinary,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  upload: {
    maxFileSizeBytes: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 2) * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  },
  rateLimit: {
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15) * 60 * 1000,
    apiMax: parseInt(process.env.RATE_LIMIT_API_MAX, 10) || 100,
    loginMax: parseInt(process.env.RATE_LIMIT_LOGIN_MAX, 10) || 5,
  },
  admin: {
    name: process.env.ADMIN_NAME || "System Admin",
    email: (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase().trim(),
    password: process.env.ADMIN_PASSWORD || "Admin@1234",
  },
});

module.exports = config;
