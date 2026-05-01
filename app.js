const express = require("express");
const { API_PREFIX } = require("./src/constants");
const { sendSuccess } = require("./src/utils/response");
const { connectDB } = require("./src/config/database");

// Import routes
const authRoutes = require("./src/routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== DATABASE CONNECTION ====================
connectDB();

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES ====================

// Health check / API info route
app.get("/", (req, res) => {
  sendSuccess(
    res,
    {
      api: "Tuk-Tuk Tracking API",
      version: "1.0.0",
      status: "running",
      timestamp: new Date().toISOString(),
    },
    "API is operational",
  );
});

// API v1 routes (to be implemented)
app.get(`${API_PREFIX}/health`, async (req, res) => {
  const { healthCheck } = require("./src/config/database");
  const dbStatus = await healthCheck();

  sendSuccess(
    res,
    {
      status: "healthy",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    },
    "API health check",
  );
});

// Authentication routes
app.use(`${API_PREFIX}/auth`, authRoutes);

// Provinces routes - placeholder
app.get(`${API_PREFIX}/provinces`, (req, res) => {
  res.json({ message: "Get provinces - to be implemented" });
});

// Districts routes - placeholder
app.get(`${API_PREFIX}/districts`, (req, res) => {
  res.json({ message: "Get districts - to be implemented" });
});

// Police Stations routes - placeholder
app.get(`${API_PREFIX}/police-stations`, (req, res) => {
  res.json({ message: "Get police stations - to be implemented" });
});

// Vehicles routes - placeholder
app.get(`${API_PREFIX}/vehicles`, (req, res) => {
  res.json({ message: "Get vehicles - to be implemented" });
});

// Locations routes - placeholder
app.post(`${API_PREFIX}/locations/ping`, (req, res) => {
  res.json({ message: "Submit location ping - to be implemented" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🚗 Tuk-Tuk Tracking API Server`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(
    `📚 API Documentation: http://localhost:${PORT}${API_PREFIX}/docs`,
  );
  console.log(`❤️  Health Check: http://localhost:${PORT}${API_PREFIX}/health`);
  console.log(
    `🔐 Authentication: http://localhost:${PORT}${API_PREFIX}/auth/login`,
  );
  console.log(`${"=".repeat(50)}\n`);
});

module.exports = app;
