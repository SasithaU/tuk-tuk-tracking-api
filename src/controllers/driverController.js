const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, STATUS_CODES } = require("../constants");

const listDrivers = async (req, res) => {
  try {
    const filter = {};

    // Apply filters
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.licenseNumber) {
      filter.licenseNumber = new RegExp(req.query.licenseNumber, "i");
    }

    if (req.query.contactNumber) {
      filter.contactNumber = req.query.contactNumber;
    }

    const drivers = await Driver.find(filter)
      .populate("vehicleId", "registrationNumber status")
      .sort({ name: 1 })
      .lean();

    return sendSuccess(res, drivers, "Drivers listed successfully");
  } catch (error) {
    console.error("listDrivers error:", error.message);
    return sendError(res, ERROR_CODES.INTERNAL_ERROR, "Unable to list drivers");
  }
};

const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate("vehicleId", "registrationNumber deviceId status")
      .lean();

    if (!driver) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Driver not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    return sendSuccess(res, driver, "Driver details retrieved successfully");
  } catch (error) {
    console.error("getDriverById error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve driver",
    );
  }
};

const createDriver = async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      contactNumber,
      email,
      dateOfBirth,
      vehicleId,
      address,
      emergencyContact,
      status,
      licenseExpiryDate,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !licenseNumber ||
      !contactNumber ||
      !dateOfBirth ||
      !licenseExpiryDate
    ) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Name, license number, contact number, date of birth, and license expiry date are required",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Check if vehicle exists if provided
    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          "Invalid vehicle ID",
          STATUS_CODES.BAD_REQUEST,
        );
      }
    }

    const driver = new Driver({
      name,
      licenseNumber,
      contactNumber,
      email,
      dateOfBirth,
      vehicleId,
      address,
      emergencyContact,
      status: status || "active",
      licenseExpiryDate,
      notes,
    });

    await driver.save();

    const populatedDriver = await Driver.findById(driver._id)
      .populate("vehicleId", "registrationNumber status")
      .lean();

    return sendSuccess(
      res,
      populatedDriver,
      "Driver created successfully",
      STATUS_CODES.CREATED,
    );
  } catch (error) {
    console.error("createDriver error:", error.message);

    if (error.code === 11000) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Driver with this license number already exists",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to create driver",
    );
  }
};

const updateDriver = async (req, res) => {
  try {
    const {
      name,
      licenseNumber,
      contactNumber,
      email,
      dateOfBirth,
      vehicleId,
      address,
      emergencyContact,
      status,
      licenseExpiryDate,
      notes,
    } = req.body;

    // Check if driver exists
    const existingDriver = await Driver.findById(req.params.id);
    if (!existingDriver) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Driver not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    // Check if vehicle exists if provided
    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          "Invalid vehicle ID",
          STATUS_CODES.BAD_REQUEST,
        );
      }
    }

    const updateData = {
      name,
      licenseNumber,
      contactNumber,
      email,
      dateOfBirth,
      vehicleId,
      address,
      emergencyContact,
      status,
      licenseExpiryDate,
      notes,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const driver = await Driver.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("vehicleId", "registrationNumber status");

    return sendSuccess(res, driver, "Driver updated successfully");
  } catch (error) {
    console.error("updateDriver error:", error.message);

    if (error.code === 11000) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Driver with this license number already exists",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to update driver",
    );
  }
};

const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Driver not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    await Driver.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, "Driver deleted successfully");
  } catch (error) {
    console.error("deleteDriver error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to delete driver",
    );
  }
};

module.exports = {
  listDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
};
