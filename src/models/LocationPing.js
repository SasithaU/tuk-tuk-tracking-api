/**
 * Location Ping Model
 * Stores individual GPS location updates from vehicles
 */

const mongoose = require("mongoose");

const locationPingSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle ID is required"],
      index: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required"],
      min: [-90, "Latitude must be between -90 and 90"],
      max: [90, "Latitude must be between -90 and 90"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required"],
      min: [-180, "Longitude must be between -180 and 180"],
      max: [180, "Longitude must be between -180 and 180"],
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    accuracy: {
      type: Number,
      min: [0, "Accuracy must be non-negative"],
      max: [1000, "Accuracy seems too high (max 1000 meters)"],
      default: 10,
    },
    speed: {
      type: Number,
      min: [0, "Speed must be non-negative"],
      max: [200, "Speed seems too high (max 200 km/h)"],
      default: 0,
    },
    heading: {
      type: Number,
      min: [0, "Heading must be between 0 and 360"],
      max: [360, "Heading must be between 0 and 360"],
    },
    altitude: {
      type: Number,
      min: [-500, "Altitude seems too low"],
      max: [10000, "Altitude seems too high"],
    },
    source: {
      type: String,
      enum: {
        values: ["GPS", "Network", "Fused", "Manual"],
        message: "Invalid source. Must be one of: GPS, Network, Fused, Manual",
      },
      default: "GPS",
    },
    batteryLevel: {
      type: Number,
      min: [0, "Battery level must be between 0 and 100"],
      max: [100, "Battery level must be between 0 and 100"],
    },
    networkType: {
      type: String,
      enum: ["WiFi", "4G", "3G", "2G", "Unknown"],
    },
  },
  {
    timestamps: true,
    // Disable automatic timestamps since we have explicit timestamp field
    createdAt: false,
    updatedAt: false,
  },
);

// Compound indexes for efficient queries
locationPingSchema.index({ vehicleId: 1, timestamp: -1 }); // Vehicle history queries
locationPingSchema.index({ vehicleId: 1, timestamp: -1, accuracy: 1 }); // Filtered history

// TTL index to automatically delete old pings after 90 days
locationPingSchema.index(
  { timestamp: 1 },
  {
    expireAfterSeconds: 90 * 24 * 60 * 60, // 90 days in seconds
  },
);


// Static method to get latest ping for a vehicle
locationPingSchema.statics.getLatestPing = function (vehicleId) {
  return this.findOne({ vehicleId })
    .sort({ timestamp: -1 })
    .select("latitude longitude timestamp accuracy speed heading");
};

// Static method to get pings within time range
locationPingSchema.statics.getPingsInRange = function (
  vehicleId,
  startDate,
  endDate,
) {
  return this.find({
    vehicleId,
    timestamp: {
      $gte: startDate,
      $lte: endDate,
    },
  })
    .sort({ timestamp: 1 })
    .select("latitude longitude timestamp accuracy speed heading");
};

module.exports = mongoose.model("LocationPing", locationPingSchema);
