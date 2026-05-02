/**
 * Province Model
 * Represents administrative provinces in Sri Lanka
 */

const mongoose = require("mongoose");

const provinceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Province name is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Province name cannot exceed 50 characters"],
    },
    code: {
      type: String,
      required: [true, "Province code is required"],
      unique: true,
      uppercase: true,
      minlength: [2, "Province code must be at least 2 characters"],
      maxlength: [5, "Province code cannot exceed 5 characters"],
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

// Virtual for district count
provinceSchema.virtual("districtCount", {
  ref: "District",
  localField: "_id",
  foreignField: "provinceId",
  count: true,
});

// Index for faster queries

module.exports = mongoose.model("Province", provinceSchema);
