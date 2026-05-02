const express = require("express");
const router = express.Router();
const {
  listPoliceStations,
  getPoliceStationById,
} = require("../controllers/policeStationController");

router.get("/", listPoliceStations);
router.get("/:id", getPoliceStationById);

module.exports = router;
