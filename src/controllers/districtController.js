const District = require("../models/District");
const PoliceStation = require("../models/PoliceStation");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, STATUS_CODES } = require("../constants");

const listDistricts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.provinceId) {
      filter.provinceId = req.query.provinceId;
    }

    const districts = await District.find(filter).sort({ name: 1 }).lean();
    return sendSuccess(res, districts, "Districts listed successfully");
  } catch (error) {
    console.error("listDistricts error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to list districts",
    );
  }
};

const getDistrictById = async (req, res) => {
  try {
    const district = await District.findById(req.params.id).lean();
    if (!district) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "District not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    return sendSuccess(
      res,
      district,
      "District details retrieved successfully",
    );
  } catch (error) {
    console.error("getDistrictById error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve district",
    );
  }
};

const getStationsByDistrict = async (req, res) => {
  try {
    const stations = await PoliceStation.find({ districtId: req.params.id })
      .sort({ name: 1 })
      .lean();
    return sendSuccess(
      res,
      stations,
      "Police stations for district retrieved successfully",
    );
  } catch (error) {
    console.error("getStationsByDistrict error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve police stations for district",
    );
  }
};

module.exports = {
  listDistricts,
  getDistrictById,
  getStationsByDistrict,
};
