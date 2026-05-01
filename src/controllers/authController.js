/**
 * Authentication Controller
 * Handles user login, logout, and token management
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");
const { ERROR_CODES, STATUS_CODES } = require("../constants");

// Generate JWT token
const generateToken = (userId, role) => {
  const payload = {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
  };

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRE || "1h";

  return jwt.sign(payload, secret, { expiresIn });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  const payload = {
    userId,
    type: "refresh",
    iat: Math.floor(Date.now() / 1000),
  };

  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRE || "7d";

  return jwt.sign(payload, secret, { expiresIn });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// User login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Username and password are required",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Find user and verify password
    const user = await User.findByCredentials(username, password);

    // Check if user is active
    if (!user.isActive) {
      return sendError(
        res,
        ERROR_CODES.UNAUTHORIZED,
        "Account is deactivated",
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Prepare user data (exclude sensitive information)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      assignedStationId: user.assignedStationId,
      assignedDistrictId: user.assignedDistrictId,
      assignedProvinceId: user.assignedProvinceId,
      lastLoginAt: user.lastLoginAt,
    };

    sendSuccess(
      res,
      {
        user: userData,
        token,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRE || "1h",
      },
      "Login successful",
    );
  } catch (error) {
    console.error("Login error:", error.message);

    if (error.message === "Invalid login credentials") {
      return sendError(
        res,
        ERROR_CODES.UNAUTHORIZED,
        "Invalid username or password",
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    sendError(res, ERROR_CODES.INTERNAL_ERROR, "Login failed");
  }
};

// User logout
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token from client storage
    // Optionally, you could implement a token blacklist here

    sendSuccess(res, null, "Logout successful");
  } catch (error) {
    console.error("Logout error:", error.message);
    sendError(res, ERROR_CODES.INTERNAL_ERROR, "Logout failed");
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Refresh token is required",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Verify refresh token
    const decoded = verifyToken(token);

    if (decoded.type !== "refresh") {
      return sendError(
        res,
        ERROR_CODES.INVALID_TOKEN,
        "Invalid refresh token",
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return sendError(
        res,
        ERROR_CODES.UNAUTHORIZED,
        "User not found or inactive",
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    // Generate new tokens
    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    sendSuccess(
      res,
      {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRE || "1h",
      },
      "Token refreshed successfully",
    );
  } catch (error) {
    console.error("Token refresh error:", error.message);
    sendError(
      res,
      ERROR_CODES.INVALID_TOKEN,
      "Invalid refresh token",
      STATUS_CODES.UNAUTHORIZED,
    );
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("assignedStationId", "name code")
      .populate("assignedDistrictId", "name code")
      .populate("assignedProvinceId", "name code")
      .select("-passwordHash -passwordResetToken -passwordResetExpires");

    if (!user) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "User not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    sendSuccess(res, user, "Profile retrieved successfully");
  } catch (error) {
    console.error("Get profile error:", error.message);
    sendError(res, ERROR_CODES.INTERNAL_ERROR, "Failed to retrieve profile");
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Current password and new password are required",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    if (newPassword.length < 8) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "New password must be at least 8 characters long",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return sendError(
        res,
        ERROR_CODES.NOT_FOUND,
        "User not found",
        STATUS_CODES.NOT_FOUND,
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return sendError(
        res,
        ERROR_CODES.BAD_REQUEST,
        "Current password is incorrect",
        STATUS_CODES.BAD_REQUEST,
      );
    }

    // Update password (pre-save middleware will hash it)
    user.passwordHash = newPassword;
    await user.save();

    sendSuccess(res, null, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error.message);
    sendError(res, ERROR_CODES.INTERNAL_ERROR, "Failed to change password");
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getProfile,
  changePassword,
  generateToken,
  verifyToken,
};
