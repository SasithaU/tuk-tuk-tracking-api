/**
 * User Model
 * Represents system users with role-based access control
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9_]+$/.test(v);
        },
        message: "Username can only contain letters, numbers, and underscores",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["admin", "provincial_admin", "station_officer", "device"],
        message:
          "Invalid role. Must be one of: admin, provincial_admin, station_officer, device",
      },
    },
    assignedStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceStation",
      required: function () {
        return this.role === "station_officer";
      },
    },
    assignedDistrictId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: function () {
        return this.role === "provincial_admin";
      },
    },
    assignedProvinceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Province",
      required: function () {
        return this.role === "provincial_admin";
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for full name (if we add first/last name fields later)
userSchema.virtual("fullName").get(function () {
  return this.username; // Placeholder
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to hash password
userSchema.methods.hashPassword = async function (password) {
  const saltRounds = 12;
  this.passwordHash = await bcrypt.hash(password, saltRounds);
};

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("passwordHash")) {
    return;
  }

  try {
    const saltRounds = 12;
    // Hash password with cost of 12
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
  } catch (error) {
    throw error;
  }
});

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({
    $or: [{ username: username }, { email: username }],
  });

  if (!user) {
    throw new Error("Invalid login credentials");
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new Error("Invalid login credentials");
  }

  return user;
};

// Indexes for faster queries
userSchema.index({ role: 1 });
userSchema.index({ assignedStationId: 1 });
userSchema.index({ assignedDistrictId: 1 });
userSchema.index({ assignedProvinceId: 1 });

module.exports = mongoose.model("User", userSchema);
