const express = require("express");
const router = express.Router();
const {
  submitLocationPing,
  getLatestLocations,
  getVehicleLatestLocation,
  getLocationHistory,
  searchLocations,
} = require("../controllers/locationController");
const { allowDeviceAccess } = require("../middleware/auth");

// Device access for location pings (allows devices and authenticated users)
router.post("/ping", allowDeviceAccess, submitLocationPing);

// Authenticated user routes
router.get("/latest", getLatestLocations);
router.get("/vehicle/:id", getVehicleLatestLocation);
router.get("/history", getLocationHistory);
router.get("/search", searchLocations);

module.exports = router;
