const express = require("express");
const router = express.Router();
const {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleLocations,
} = require("../controllers/vehicleController");
const { requireAdmin } = require("../middleware/auth");

// Public routes (authenticated users can view)
router.get("/", listVehicles);
router.get("/:id", getVehicleById);
router.get("/:id/locations", getVehicleLocations);

// Admin-only routes
router.post("/", requireAdmin, createVehicle);
router.put("/:id", requireAdmin, updateVehicle);
router.delete("/:id", requireAdmin, deleteVehicle);

module.exports = router;
