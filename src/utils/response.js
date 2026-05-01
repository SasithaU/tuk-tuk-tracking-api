/**
 * API Response utilities
 * Standardized response format for all API endpoints
 */

const { STATUS_CODES } = require("../constants");

/**
 * Send success response
 */
const sendSuccess = (
  res,
  data = null,
  message = "Success",
  statusCode = STATUS_CODES.OK,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

/**
 * Send paginated response
 */
const sendPaginatedSuccess = (
  res,
  data,
  pagination,
  message = "Success",
  statusCode = STATUS_CODES.OK,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
    message,
  });
};

/**
 * Send error response
 */
const sendError = (
  res,
  errorCode,
  errorMessage,
  statusCode = STATUS_CODES.INTERNAL_ERROR,
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
    },
  });
};

/**
 * Send validation error response
 */
const sendValidationError = (res, errors) => {
  return res.status(STATUS_CODES.BAD_REQUEST).json({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: errors,
    },
  });
};

module.exports = {
  sendSuccess,
  sendPaginatedSuccess,
  sendError,
  sendValidationError,
};
