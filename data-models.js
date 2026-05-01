/**
 * Data Models for Tuk-Tuk Tracking API
 * Defines the structure of MongoDB collections
 */

// Province Model
const ProvinceSchema = {
  _id: "UUID",
  name: "string (required, unique)",
  code: "string (required, unique)",
  description: "string",
  createdAt: "Date",
  updatedAt: "Date",
};

// District Model
const DistrictSchema = {
  _id: "UUID",
  provinceId: "UUID (FK to Province)",
  name: "string (required)",
  code: "string (required)",
  description: "string",
  createdAt: "Date",
  updatedAt: "Date",
};

// Police Station Model
const PoliceStationSchema = {
  _id: "UUID",
  districtId: "UUID (FK to District)",
  name: "string (required)",
  code: "string (required)",
  location: {
    type: "Point (GeoJSON)",
    coordinates: "[longitude, latitude]",
  },
  contactNumber: "string",
  email: "string",
  stationOfficer: "string",
  createdAt: "Date",
  updatedAt: "Date",
};

// Vehicle/Tuk-Tuk Model
const VehicleSchema = {
  _id: "UUID",
  registrationNumber: "string (required, unique)",
  deviceId: "string (required, unique) - GPS device identifier",
  driverId: "UUID (FK to Driver)",
  status: "string (active/inactive/suspended)",
  color: "string",
  manufacturerYear: "number",
  createdAt: "Date",
  updatedAt: "Date",
};

// Driver Model
const DriverSchema = {
  _id: "UUID",
  name: "string (required)",
  licenseNumber: "string (required, unique)",
  contactNumber: "string (required)",
  email: "string",
  dateOfBirth: "Date",
  vehicleId: "UUID (FK to Vehicle)",
  status: "string (active/inactive)",
  createdAt: "Date",
  updatedAt: "Date",
};

// Location Ping Model (for storing each GPS update)
const LocationPingSchema = {
  _id: "UUID",
  vehicleId: "UUID (FK to Vehicle, indexed)",
  latitude: "decimal (required)",
  longitude: "decimal (required)",
  timestamp: "Date (indexed)",
  accuracy: "number (meters)",
  speed: "number (km/h)",
  heading: "number (degrees 0-360)",
  altitude: "number (meters)",
  source: "string (GPS/Network/Fused)",
  createdAt: "Date",
  // Note: Indexed on (vehicleId, timestamp) for efficient queries
};

// Last Known Location Model (cache/denormalized)
const LastKnownLocationSchema = {
  _id: "UUID",
  vehicleId: "UUID (FK to Vehicle, unique indexed)",
  latitude: "decimal (required)",
  longitude: "decimal (required)",
  timestamp: "Date",
  accuracy: "number",
  speed: "number",
  heading: "number",
  updatedAt: "Date (TTL index: auto-delete if stale > 24 hours)",
};

// User Model
const UserSchema = {
  _id: "UUID",
  username: "string (required, unique)",
  email: "string (required, unique)",
  passwordHash: "string (bcrypt hashed)",
  role: "string (admin/provincial_admin/station_officer/device - required)",
  assignedStationId: "UUID (FK, nullable - for station_officer role)",
  assignedDistrictId: "UUID (FK, nullable - for provincial_admin role)",
  assignedProvinceId: "UUID (FK, nullable - for provincial_admin role)",
  isActive: "boolean (default: true)",
  lastLoginAt: "Date",
  createdAt: "Date",
  updatedAt: "Date",
};

// Device (Alternative to User for automated location submissions)
const DeviceSchema = {
  _id: "UUID",
  deviceId: "string (required, unique)",
  vehicleId: "UUID (FK to Vehicle)",
  apiKey: "string (hashed)",
  isActive: "boolean",
  lastPingAt: "Date",
  createdAt: "Date",
  updatedAt: "Date",
};

// Audit Log Model (optional but recommended)
const AuditLogSchema = {
  _id: "UUID",
  userId: "UUID (FK to User)",
  action: "string (CREATE/UPDATE/DELETE/READ)",
  resource: "string (Province/District/Vehicle/etc)",
  resourceId: "UUID",
  oldValues: "object (previous values)",
  newValues: "object (new values)",
  ipAddress: "string",
  timestamp: "Date",
};

module.exports = {
  ProvinceSchema,
  DistrictSchema,
  PoliceStationSchema,
  VehicleSchema,
  DriverSchema,
  LocationPingSchema,
  LastKnownLocationSchema,
  UserSchema,
  DeviceSchema,
  AuditLogSchema,
};
