/**
 * Vehicle Model
 * Represents tuk-tuk vehicles in the tracking system
 */

const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, "Registration number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Sri Lankan vehicle registration format validation
          return /^[A-Z]{1,3}[-\s]?[0-9]{4}[A-Z]?$/.test(v.replace(/\s/g, ""));
        },
        message: "Invalid Sri Lankan vehicle registration format",
      },
    },
    deviceId: {
      type: String,
      required: [true, "Device ID is required"],
      unique: true,
      trim: true,
      minlength: [8, "Device ID must be at least 8 characters"],
      maxlength: [20, "Device ID cannot exceed 20 characters"],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended", "maintenance"],
        message:
          "Invalid status. Must be one of: active, inactive, suspended, maintenance",
      },
      default: "active",
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, "Color cannot exceed 30 characters"],
    },
    manufacturerYear: {
      type: Number,
      min: [2000, "Manufacturer year must be 2000 or later"],
      max: [
        new Date().getFullYear() + 1,
        "Manufacturer year cannot be in the future",
      ],
    },
    make: {
      type: String,
      trim: true,
      maxlength: [50, "Make cannot exceed 50 characters"],
    },
    model: {
      type: String,
      trim: true,
      maxlength: [50, "Model cannot exceed 50 characters"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [200, "Notes cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for last known location
vehicleSchema.virtual("lastLocation", {
  ref: "LastKnownLocation",
  localField: "_id",
  foreignField: "vehicleId",
  justOne: true,
});

// Virtual for location ping count
vehicleSchema.virtual("pingCount", {
  ref: "LocationPing",
  localField: "_id",
  foreignField: "vehicleId",
  count: true,
});

// Indexes for faster queries
vehicleSchema.index({ registrationNumber: 1 });
vehicleSchema.index({ deviceId: 1 });
vehicleSchema.index({ driverId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ createdAt: -1 }); // For recent vehicles

module.exports = mongoose.model("Vehicle", vehicleSchema);
