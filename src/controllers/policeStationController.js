const PoliceStation = require("../models/PoliceStation");
const District = require("../models/District");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, STATUS_CODES } = require("../constants");

const listPoliceStations = async (req, res) => {
  try {
    const filter = {};

    if (req.query.districtId) {
      filter.districtId = req.query.districtId;
    }

    if (req.query.provinceId) {
      const districts = await District.find({
        provinceId: req.query.provinceId,
      }).select("_id");
      filter.districtId = districts.map((district) => district._id);
    }

    const stations = await PoliceStation.find(filter).sort({ name: 1 }).lean();
    return sendSuccess(res, stations, "Police stations listed successfully");
  } catch (error) {
    console.error("listPoliceStations error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to list police stations",
    );
  }
};

const getPoliceStationById = async (req, res) => {
  try {
    const station = await PoliceStation.findById(req.params.id).lean();
    if (!station) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Police station not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    return sendSuccess(
      res,
      station,
      "Police station details retrieved successfully",
    );
  } catch (error) {
    console.error("getPoliceStationById error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve police station",
    );
  }
};

module.exports = {
  listPoliceStations,
  getPoliceStationById,
};
