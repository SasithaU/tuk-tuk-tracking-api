/**
 * Constants and configuration values
 */

const API_VERSION = "v1";
const API_PREFIX = `/api/${API_VERSION}`;

// Routes
const ROUTES = {
  AUTH: `${API_PREFIX}/auth`,
  PROVINCES: `${API_PREFIX}/provinces`,
  DISTRICTS: `${API_PREFIX}/districts`,
  POLICE_STATIONS: `${API_PREFIX}/police-stations`,
  VEHICLES: `${API_PREFIX}/vehicles`,
  DRIVERS: `${API_PREFIX}/drivers`,
  LOCATIONS: `${API_PREFIX}/locations`,
  USERS: `${API_PREFIX}/users`,
};

// Error Codes
const ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  INVALID_TOKEN: "INVALID_TOKEN",
};

// HTTP Status Codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

// User Roles
const USER_ROLES = {
  ADMIN: "admin",
  PROVINCIAL_ADMIN: "provincial_admin",
  STATION_OFFICER: "station_officer",
  DEVICE: "device",
};

// Vehicle Status
const VEHICLE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
};

module.exports = {
  API_VERSION,
  API_PREFIX,
  ROUTES,
  ERROR_CODES,
  STATUS_CODES,
  USER_ROLES,
  VEHICLE_STATUS,
};
