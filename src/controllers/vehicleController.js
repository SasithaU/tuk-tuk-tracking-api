const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, STATUS_CODES } = require("../constants");

const listVehicles = async (req, res) => {
  try {
    const filter = {};

    // Apply filters
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.driverId) {
      filter.driverId = req.query.driverId;
    }

    if (req.query.registrationNumber) {
      filter.registrationNumber = new RegExp(req.query.registrationNumber, "i");
    }

    const vehicles = await Vehicle.find(filter)
      .populate("driverId", "name licenseNumber contactNumber")
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, vehicles, "Vehicles listed successfully");
  } catch (error) {
    console.error("listVehicles error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to list vehicles",
    );
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate("driverId", "name licenseNumber contactNumber email")
      .lean();

    if (!vehicle) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Vehicle not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    return sendSuccess(res, vehicle, "Vehicle details retrieved successfully");
  } catch (error) {
    console.error("getVehicleById error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve vehicle",
    );
  }
};

const createVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      deviceId,
      driverId,
      status,
      color,
      manufacturerYear,
      make,
      model,
      notes,
    } = req.body;

    // Validate required fields
    if (!registrationNumber || !deviceId) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Registration number and device ID are required",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Check if driver exists if provided
    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          "Invalid driver ID",
          STATUS_CODES.BAD_REQUEST,
        );
      }
    }

    const vehicle = new Vehicle({
      registrationNumber,
      deviceId,
      driverId,
      status: status || "active",
      color,
      manufacturerYear,
      make,
      model,
      notes,
    });

    await vehicle.save();

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate("driverId", "name licenseNumber contactNumber")
      .lean();

    return sendSuccess(
      res,
      populatedVehicle,
      "Vehicle created successfully",
      STATUS_CODES.CREATED,
    );
  } catch (error) {
    console.error("createVehicle error:", error.message);

    if (error.code === 11000) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Vehicle with this registration number or device ID already exists",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to create vehicle",
    );
  }
};

const updateVehicle = async (req, res) => {
  try {
    const {
      registrationNumber,
      deviceId,
      driverId,
      status,
      color,
      manufacturerYear,
      make,
      model,
      notes,
    } = req.body;

    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(req.params.id);
    if (!existingVehicle) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Vehicle not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    // Check if driver exists if provided
    if (driverId) {
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return sendError(
          res,
          ERROR_CODES.BAD_REQUEST,
          "Invalid driver ID",
          STATUS_CODES.BAD_REQUEST,
        );
      }
    }

    const updateData = {
      registrationNumber,
      deviceId,
      driverId,
      status,
      color,
      manufacturerYear,
      make,
      model,
      notes,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("driverId", "name licenseNumber contactNumber");

    return sendSuccess(res, vehicle, "Vehicle updated successfully");
  } catch (error) {
    console.error("updateVehicle error:", error.message);

    if (error.code === 11000) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Vehicle with this registration number or device ID already exists",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to update vehicle",
    );
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Vehicle not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, "Vehicle deleted successfully");
  } catch (error) {
    console.error("deleteVehicle error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to delete vehicle",
    );
  }
};

const getVehicleLocations = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Vehicle not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    // Get last known location
    const LastKnownLocation = require("../models/LastKnownLocation");
    const lastLocation = await LastKnownLocation.findOne({
      vehicleId: req.params.id,
    });

    return sendSuccess(
      res,
      {
        vehicle: {
          id: vehicle._id,
          registrationNumber: vehicle.registrationNumber,
          status: vehicle.status,
        },
        lastLocation,
      },
      "Vehicle locations retrieved successfully",
    );
  } catch (error) {
    console.error("getVehicleLocations error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve vehicle locations",
    );
  }
};

module.exports = {
  listVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleLocations,
};
