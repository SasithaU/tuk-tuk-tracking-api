const Province = require("../models/Province");
const District = require("../models/District");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, STATUS_CODES } = require("../constants");

const listProvinces = async (req, res) => {
  try {
    const provinces = await Province.find().sort({ name: 1 }).lean();
    return sendSuccess(res, provinces, "Provinces listed successfully");
  } catch (error) {
    console.error("listProvinces error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to list provinces",
    );
  }
};

const getProvinceById = async (req, res) => {
  try {
    const province = await Province.findById(req.params.id).lean();
    if (!province) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Province not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    return sendSuccess(
      res,
      province,
      "Province details retrieved successfully",
    );
  } catch (error) {
    console.error("getProvinceById error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve province",
    );
  }
};

const getDistrictsByProvince = async (req, res) => {
  try {
    const provinceId = req.params.id;
    const districts = await District.find({ provinceId })
      .sort({ name: 1 })
      .lean();
    return sendSuccess(
      res,
      districts,
      "Districts for province retrieved successfully",
    );
  } catch (error) {
    console.error("getDistrictsByProvince error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve districts for province",
    );
  }
};

module.exports = {
  listProvinces,
  getProvinceById,
  getDistrictsByProvince,
};
