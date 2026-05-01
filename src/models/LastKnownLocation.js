/**
 * Last Known Location Model
 * Caches the most recent location for each vehicle (denormalized for performance)
 */

const mongoose = require("mongoose");

const lastKnownLocationSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle ID is required"],
      unique: true,
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
      required: [true, "Timestamp is required"],
      index: true,
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
    source: {
      type: String,
      enum: {
        values: ["GPS", "Network", "Fused", "Manual"],
        message: "Invalid source. Must be one of: GPS, Network, Fused, Manual",
      },
      default: "GPS",
    },
  },
  {
    timestamps: true,
  },
);

// TTL index to automatically refresh stale locations after 24 hours
lastKnownLocationSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 24 * 60 * 60, // 24 hours in seconds
  },
);

// Index for geospatial queries
lastKnownLocationSchema.index({ latitude: 1, longitude: 1 });

// Static method to update or create last known location
lastKnownLocationSchema.statics.updateLocation = async function (
  vehicleId,
  locationData,
) {
  const updateData = {
    ...locationData,
    updatedAt: new Date(),
  };

  return this.findOneAndUpdate({ vehicleId }, updateData, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });
};

// Static method to get multiple vehicles' last locations
lastKnownLocationSchema.statics.getMultipleLocations = function (vehicleIds) {
  return this.find({
    vehicleId: { $in: vehicleIds },
  })
    .populate("vehicleId", "registrationNumber status")
    .select("vehicleId latitude longitude timestamp accuracy speed heading");
};

// Static method to find vehicles near a point
lastKnownLocationSchema.statics.findNearby = function (
  centerLat,
  centerLng,
  radiusKm = 10,
) {
  // Convert km to degrees (approximate)
  const radiusDegrees = radiusKm / 111.32; // 1 degree ≈ 111.32 km

  return this.find({
    latitude: {
      $gte: centerLat - radiusDegrees,
      $lte: centerLat + radiusDegrees,
    },
    longitude: {
      $gte: centerLng - radiusDegrees,
      $lte: centerLng + radiusDegrees,
    },
  })
    .populate("vehicleId", "registrationNumber status")
    .select("vehicleId latitude longitude timestamp accuracy speed");
};

module.exports = mongoose.model("LastKnownLocation", lastKnownLocationSchema);
