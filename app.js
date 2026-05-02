const express = require("express");
const { API_PREFIX } = require("./src/constants");
const { sendSuccess } = require("./src/utils/response");
const { connectDB } = require("./src/config/database");

// Import routes
const authRoutes = require("./src/routes/auth");
const provinceRoutes = require("./src/routes/provinces");
const districtRoutes = require("./src/routes/districts");
const policeStationRoutes = require("./src/routes/police-stations");
const vehicleRoutes = require("./src/routes/vehicles");
const driverRoutes = require("./src/routes/drivers");
const locationRoutes = require("./src/routes/locations");

// Import middleware
const { verifyTokenMiddleware } = require("./src/middleware/auth");

// Import swagger config
const { setupSwagger } = require("./src/config/swagger");

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

// Swagger API Documentation
setupSwagger(app, API_PREFIX);

// Health check / API info route (no auth required)
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

// Authentication routes (no auth required for login/refresh)
app.use(`${API_PREFIX}/auth`, authRoutes);

// Province and district API routes (require authentication)
console.log("Province routes required");
console.log("Mounting province routes...");
app.use(`${API_PREFIX}/provinces`, provinceRoutes); // Temporarily remove middleware for testing
console.log("Province routes mounted");
app.use(`${API_PREFIX}/districts`, verifyTokenMiddleware, districtRoutes);
app.use(
  `${API_PREFIX}/police-stations`,
  verifyTokenMiddleware,
  policeStationRoutes,
);

// Vehicle and driver management routes (require authentication)
console.log("Mounting vehicle routes...");
app.use(`${API_PREFIX}/vehicles`, vehicleRoutes); // Temporarily remove middleware for testing
console.log("Vehicle routes mounted");
app.use(`${API_PREFIX}/drivers`, verifyTokenMiddleware, driverRoutes);

// Location tracking routes (require authentication)
app.use(`${API_PREFIX}/locations`, verifyTokenMiddleware, locationRoutes);

// 404 handler
app.use((req, res) => {
  console.log(
    `404 HANDLER: ${req.method} ${req.path} - Original URL: ${req.originalUrl}`,
  );
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
