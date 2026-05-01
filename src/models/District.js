/**
 * District Model
 * Represents administrative districts within provinces
 */

const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    provinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      required: [true, "Province ID is required"],
    },
    name: {
      type: String,
      required: [true, "District name is required"],
      trim: true,
      maxlength: [50, "District name cannot exceed 50 characters"],
    },
    code: {
      type: String,
      required: [true, "District code is required"],
      uppercase: true,
      minlength: [2, "District code must be at least 2 characters"],
      maxlength: [5, "District code cannot exceed 5 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for police station count
districtSchema.virtual("stationCount", {
  ref: "PoliceStation",
  localField: "_id",
  foreignField: "districtId",
  count: true,
});

// Virtual for vehicle count in district
districtSchema.virtual("vehicleCount", {
  ref: "Vehicle",
  localField: "_id",
  foreignField: "districtId",
  count: true,
});

// Indexes for faster queries
districtSchema.index({ provinceId: 1 });
districtSchema.index({ name: 1 });
districtSchema.index({ code: 1 });
districtSchema.index({ provinceId: 1, name: 1 }); // Compound index

module.exports = mongoose.model("District", districtSchema);
