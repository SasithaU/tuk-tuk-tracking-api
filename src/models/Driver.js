/**
 * Driver Model
 * Represents tuk-tuk drivers in the system
 */

const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
      maxlength: [100, "Driver name cannot exceed 100 characters"],
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Sri Lankan driving license format validation
          return /^[A-Z]{1,2}[0-9]{7,8}$/.test(v);
        },
        message: "Invalid Sri Lankan driving license format",
      },
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
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
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (v) {
          const age = Math.floor(
            (new Date() - new Date(v)) / (365.25 * 24 * 60 * 60 * 1000),
          );
          return age >= 18 && age <= 80;
        },
        message: "Driver must be between 18 and 80 years old",
      },
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, "Emergency contact name cannot exceed 100 characters"],
      },
      number: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return !v || /^[\+]?[1-9][\d]{0,15}$/.test(v);
          },
          message: "Invalid emergency contact number format",
        },
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [50, "Relationship cannot exceed 50 characters"],
      },
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "suspended", "terminated"],
        message:
          "Invalid status. Must be one of: active, inactive, suspended, terminated",
      },
      default: "active",
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, "License expiry date is required"],
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "License expiry date must be in the future",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, "Notes cannot exceed 300 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for age calculation
driverSchema.virtual("age").get(function () {
  return Math.floor(
    (new Date() - new Date(this.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000),
  );
});

// Virtual for license status
driverSchema.virtual("licenseStatus").get(function () {
  const daysUntilExpiry = Math.floor(
    (new Date(this.licenseExpiryDate) - new Date()) / (24 * 60 * 60 * 1000),
  );
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry < 30) return "expiring_soon";
  return "valid";
});

// Indexes for faster queries
driverSchema.index({ contactNumber: 1 });
driverSchema.index({ email: 1 });
driverSchema.index({ vehicleId: 1 });
driverSchema.index({ status: 1 });
driverSchema.index({ licenseExpiryDate: 1 });

module.exports = mongoose.model("Driver", driverSchema);
