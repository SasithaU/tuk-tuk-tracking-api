/**
 * Police Station Model
 * Represents police stations within districts
 */

const mongoose = require("mongoose");

const policeStationSchema = new mongoose.Schema(
  {
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: [true, "District ID is required"],
    },
    name: {
      type: String,
      required: [true, "Police station name is required"],
      trim: true,
      maxlength: [100, "Police station name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Police station code is required"],
      unique: true,
      uppercase: true,
      minlength: [3, "Police station code must be at least 3 characters"],
      maxlength: [10, "Police station code cannot exceed 10 characters"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Location coordinates are required"],
        validate: {
          validator: function (v) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: "Invalid coordinates format or range",
        },
      },
    },
    contactNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: "Invalid contact number format",
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    stationOfficer: {
      type: String,
      trim: true,
      maxlength: [100, "Station officer name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Create geospatial index for location queries
policeStationSchema.index({ location: "2dsphere" });

// Virtual for user count (officers assigned to this station)
policeStationSchema.virtual("officerCount", {
  ref: "User",
  localField: "_id",
  foreignField: "assignedStationId",
  count: true,
});

// Indexes for faster queries
policeStationSchema.index({ districtId: 1 });
policeStationSchema.index({ name: 1 });
policeStationSchema.index({ code: 1 });

module.exports = mongoose.model("PoliceStation", policeStationSchema);
