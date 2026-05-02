const express = require("express");
const router = express.Router();
const {
  listDistricts,
  getDistrictById,
  getStationsByDistrict,
} = require("../controllers/districtController");

router.get("/", listDistricts);
router.get("/:id", getDistrictById);
router.get("/:id/stations", getStationsByDistrict);

module.exports = router;
