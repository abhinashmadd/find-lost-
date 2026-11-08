const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { connectDB } = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");

const app = express();

// Connect to MongoDB database
connectDB();

// Security HTTP headers (allow cross-origin resource access for uploaded photos)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Apply global rate limiting to all requests
app.use(apiLimiter);

// Restrict CORS strictly to CLIENT_URL
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
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

// Catch 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Requested API endpoint not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal server error occurred",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
