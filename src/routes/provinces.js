const express = require("express");
const router = express.Router();
const {
  listProvinces,
  getProvinceById,
  getDistrictsByProvince,
} = require("../controllers/provinceController");

console.log("Province routes loaded");

router.get("/", listProvinces);
console.log("Province GET / route registered");
router.get("/:id", getProvinceById);
router.get("/:id/districts", getDistrictsByProvince);

module.exports = router;
