/**
 * Authentication Middleware
 * To be implemented with JWT validation
 */

const { sendError, STATUS_CODES } = require("../constants");
const { ERROR_CODES } = require("../constants");

/**
 * Verify JWT Token
 * This is a placeholder for now
 */
const verifyToken = (req, res, next) => {
  // TODO: Implement JWT token verification
  // Extract token from Authorization header
  // Verify and decode token
  // Attach user info to req.user

  console.log("[Auth Middleware] Token verification placeholder");
  // For now, just pass through
  next();
};

/**
 * Check user role authorization
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // TODO: Implement role-based authorization
    // Check if req.user exists and has appropriate role
    console.log("[Auth Middleware] Authorization check placeholder");
    next();
  };
};

module.exports = {
  verifyToken,
  authorize,
};
