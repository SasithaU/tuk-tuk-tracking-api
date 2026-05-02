const express = require("express");
const router = express.Router();
const {
  listDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
} = require("../controllers/driverController");
const { requireAdmin } = require("../middleware/auth");

// Public routes (authenticated users can view)
router.get("/", listDrivers);
router.get("/:id", getDriverById);

// Admin-only routes
router.post("/", requireAdmin, createDriver);
router.put("/:id", requireAdmin, updateDriver);
router.delete("/:id", requireAdmin, deleteDriver);

module.exports = router;
