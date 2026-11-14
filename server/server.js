const fs = require("fs");
const path = require("path");
// Load environment variables from server/.env with fallback to root .env
require("dotenv").config({ path: path.join(__dirname, ".env") });
if (!process.env.JWT_SECRET && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "../.env") });
}
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { connectDB } = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const AppError = require("./utils/appError");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect to MongoDB database
connectDB();

// Security HTTP headers (allow cross-origin resource access for uploaded photos)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Apply global rate limiting to all requests
app.use(apiLimiter);

// Restrict CORS to CLIENT_URL if provided, or allow dynamic origin
const allowedOrigin = process.env.CLIENT_URL;
app.use(
  cors({
    origin: allowedOrigin ? [allowedOrigin, "http://localhost:5173"] : true,
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Serve static uploaded photos for local fallback
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// Mount API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/claims", require("./routes/claims"));
app.use("/api/admin", require("./routes/admin"));

// Serve static client build if available (production full-stack deployment)
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.originalUrl.startsWith("/api")) {
      return res.sendFile(path.join(clientDistPath, "index.html"));
    }
    next();
  });
}

// Catch 404 for undefined routes
app.use((req, res, next) => {
  next(new AppError(`Requested API endpoint '${req.originalUrl}' not found`, 404));
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled Promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥 Shutting down gracefully...", err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down immediately...", err);
  process.exit(1);
});
