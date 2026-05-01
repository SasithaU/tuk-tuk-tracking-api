/**
 * Authentication Middleware
 * JWT token verification and role-based authorization
 */

const { verifyToken } = require("../controllers/authController");
const { sendError, STATUS_CODES } = require("../utils/response");
const { ERROR_CODES } = require("../constants");

/**
 * Verify JWT Token Middleware
 * Extracts and verifies JWT token from Authorization header
 */
const verifyTokenMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(
        res,
        ERROR_CODES.UNAUTHORIZED,
        "Access token is required",
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error.message);

    if (
      error.message === "Invalid token" ||
      error.name === "JsonWebTokenError"
    ) {
      return sendError(
        res,
        ERROR_CODES.INVALID_TOKEN,
        "Invalid or expired token",
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    if (error.name === "TokenExpiredError") {
      return sendError(
        res,
        ERROR_CODES.INVALID_TOKEN,
        "Token has expired",
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    sendError(res, ERROR_CODES.INTERNAL_ERROR, "Authentication failed");
  }
};

/**
 * Role-Based Authorization Middleware
 * Checks if user has required role(s)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(
        res,
        ERROR_CODES.UNAUTHORIZED,
        "Authentication required",
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        ERROR_CODES.FORBIDDEN,
        "Insufficient permissions",
        STATUS_CODES.FORBIDDEN,
      );
    }

    next();
  };
};

/**
 * Admin Only Middleware
 * Shortcut for admin role authorization
 */
const requireAdmin = authorize("admin");

/**
 * Provincial Admin or Higher Middleware
 * Allows provincial admins and admins
 */
const requireProvincialOrHigher = (req, res, next) => {
  if (!req.user) {
    return sendError(
      res,
      ERROR_CODES.UNAUTHORIZED,
      "Authentication required",
      STATUS_CODES.UNAUTHORIZED,
    );
  }

  if (!["admin", "provincial_admin"].includes(req.user.role)) {
    return sendError(
      res,
      ERROR_CODES.FORBIDDEN,
      "Provincial admin or higher permissions required",
      STATUS_CODES.FORBIDDEN,
    );
  }

  next();
};

/**
 * Station Officer or Higher Middleware
 * Allows station officers, provincial admins, and admins
 */
const requireStationOrHigher = (req, res, next) => {
  if (!req.user) {
    return sendError(
      res,
      ERROR_CODES.UNAUTHORIZED,
      "Authentication required",
      STATUS_CODES.UNAUTHORIZED,
    );
  }

  if (
    !["admin", "provincial_admin", "station_officer"].includes(req.user.role)
  ) {
    return sendError(
      res,
      ERROR_CODES.FORBIDDEN,
      "Station officer or higher permissions required",
      STATUS_CODES.FORBIDDEN,
    );
  }

  next();
};

/**
 * Device Access Middleware
 * Allows devices and all user roles (for location pings)
 */
const allowDeviceAccess = (req, res, next) => {
  // For device access, we might use API keys instead of JWT
  // For now, allow authenticated users and devices
  if (req.user) {
    return next();
  }

  // Check for device API key (placeholder for future implementation)
  const apiKey = req.headers["x-api-key"];
  if (apiKey) {
    // TODO: Verify API key
    req.device = { apiKey };
    return next();
  }

  return sendError(
    res,
    ERROR_CODES.UNAUTHORIZED,
    "Authentication required",
    STATUS_CODES.UNAUTHORIZED,
  );
};

module.exports = {
  verifyTokenMiddleware,
  authorize,
  requireAdmin,
  requireProvincialOrHigher,
  requireStationOrHigher,
  allowDeviceAccess,
};
