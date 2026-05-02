const LocationPing = require("../models/LocationPing");
const LastKnownLocation = require("../models/LastKnownLocation");
const Vehicle = require("../models/Vehicle");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, STATUS_CODES } = require("../constants");

const submitLocationPing = async (req, res) => {
  try {
    const {
      vehicleId,
      latitude,
      longitude,
      timestamp,
      accuracy,
      speed,
      heading,
      altitude,
      source,
      batteryLevel,
      networkType,
    } = req.body;

    // Validate required fields
    if (!vehicleId || latitude === undefined || longitude === undefined) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Vehicle ID, latitude, and longitude are required",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Invalid vehicle ID",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Create location ping
    const locationPing = new LocationPing({
      vehicleId,
      latitude,
      longitude,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      accuracy: accuracy || 10,
      speed: speed || 0,
      heading,
      altitude,
      source: source || "GPS",
      batteryLevel,
      networkType,
    });

    await locationPing.save();

    // Update last known location
    await LastKnownLocation.updateLocation(vehicleId, {
      latitude,
      longitude,
      timestamp: locationPing.timestamp,
      accuracy: locationPing.accuracy,
      speed: locationPing.speed,
      heading: locationPing.heading,
      source: locationPing.source,
    });

    return sendSuccess(
      res,
      {
        id: locationPing._id,
        vehicleId: locationPing.vehicleId,
        latitude: locationPing.latitude,
        longitude: locationPing.longitude,
        timestamp: locationPing.timestamp,
        accuracy: locationPing.accuracy,
      },
      "Location ping submitted successfully",
      STATUS_CODES.CREATED,
    );
  } catch (error) {
    console.error("submitLocationPing error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      `Unable to submit location ping: ${error.message}`,
    );
  }
};

const getLatestLocations = async (req, res) => {
  try {
    const latestLocations = await LastKnownLocation.find()
      .populate("vehicleId", "registrationNumber status driverId")
      .sort({ timestamp: -1 })
      .lean();

    // Populate driver info
    for (let location of latestLocations) {
      if (location.vehicleId && location.vehicleId.driverId) {
        const driver = await require("../models/Driver")
          .findById(location.vehicleId.driverId)
          .select("name contactNumber")
          .lean();
        location.vehicleId.driver = driver;
      }
    }

    return sendSuccess(
      res,
      latestLocations,
      "Latest locations retrieved successfully",
    );
  } catch (error) {
    console.error("getLatestLocations error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve latest locations",
    );
  }
};

const getVehicleLatestLocation = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Vehicle not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    const lastLocation = await LastKnownLocation.findOne({ vehicleId })
      .populate("vehicleId", "registrationNumber status")
      .lean();

    if (!lastLocation) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "No location data found for this vehicle",
        STATUS_CODES.NOT_FOUND,
      );
    }

    return sendSuccess(
      res,
      lastLocation,
      "Vehicle latest location retrieved successfully",
    );
  } catch (error) {
    console.error("getVehicleLatestLocation error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve vehicle location",
    );
  }
};

const getLocationHistory = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, limit = 100 } = req.query;

    if (!vehicleId) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Vehicle ID is required",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "Vehicle not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    let filter = { vehicleId };

    // Add date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    const locationHistory = await LocationPing.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select("latitude longitude timestamp accuracy speed heading source")
      .lean();

    return sendSuccess(
      res,
      {
        vehicle: {
          id: vehicle._id,
          registrationNumber: vehicle.registrationNumber,
          status: vehicle.status,
        },
        locations: locationHistory,
        count: locationHistory.length,
      },
      "Location history retrieved successfully",
    );
  } catch (error) {
    console.error("getLocationHistory error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to retrieve location history",
    );
  }
};

const searchLocations = async (req, res) => {
  try {
    const {
      provinceId,
      districtId,
      startDate,
      endDate,
      vehicleId,
      limit = 100,
    } = req.query;

    let filter = {};

    // Add vehicle filter
    if (vehicleId) {
      filter.vehicleId = vehicleId;
    }

    // Add date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // For province/district filtering, we need to get vehicles in those areas
    // This is a simplified implementation - in production, you'd use geospatial queries
    let vehicleIds = [];
    if (provinceId || districtId) {
      let vehicleFilter = {};

      if (districtId) {
        // Get vehicles that have been in this district (simplified - would need geospatial)
        // For now, return all vehicles - this would need proper geospatial implementation
        const vehicles = await Vehicle.find().select("_id");
        vehicleIds = vehicles.map((v) => v._id);
      } else if (provinceId) {
        // Similar logic for province
        const vehicles = await Vehicle.find().select("_id");
        vehicleIds = vehicles.map((v) => v._id);
      }

      if (vehicleIds.length > 0) {
        filter.vehicleId = { $in: vehicleIds };
      }
    }

    const locations = await LocationPing.find(filter)
      .populate("vehicleId", "registrationNumber status")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .select("latitude longitude timestamp accuracy speed heading vehicleId")
      .lean();

    return sendSuccess(
      res,
      {
        locations,
        count: locations.length,
        filters: {
          provinceId,
          districtId,
          startDate,
          endDate,
          vehicleId,
        },
      },
      "Locations search completed successfully",
    );
  } catch (error) {
    console.error("searchLocations error:", error.message);
    return sendError(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      "Unable to search locations",
    );
  }
};

module.exports = {
  submitLocationPing,
  getLatestLocations,
  getVehicleLatestLocation,
  getLocationHistory,
  searchLocations,
};
