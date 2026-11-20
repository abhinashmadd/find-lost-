const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config/env");
const { connectDB } = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const AppError = require("./utils/appError");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Connect to database
connectDB();

// Security HTTP headers (allow cross-origin resource access for uploaded photos)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Apply global rate limiting to all requests
app.use(apiLimiter);

// Restrict CORS based on central configuration
app.use(
  cors({
    origin: config.clientUrl ? [config.clientUrl, "http://localhost:5173"] : true,
    credentials: true,
  })
);

// Body parser
app.use(express.json());

// Serve static uploaded photos for local fallback
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Mount central API router (supports both /api and /api/v1 for seamless versioning)
const apiRouter = require("./routes");
app.use("/api/v1", apiRouter);
app.use("/api", apiRouter);

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

const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
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
