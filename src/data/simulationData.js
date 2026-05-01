/**
 * Simulation Data Generator
 * Generates realistic data for Sri Lanka's administrative boundaries and tuk-tuk fleet
 */

// Sri Lankan Provinces Data
const PROVINCES = [
  { name: "Western Province", code: "WP" },
  { name: "Central Province", code: "CP" },
  { name: "Southern Province", code: "SP" },
  { name: "Northern Province", code: "NP" },
  { name: "Eastern Province", code: "EP" },
  { name: "North Western Province", code: "NWP" },
  { name: "North Central Province", code: "NCP" },
  { name: "Uva Province", code: "UP" },
  { name: "Sabaragamuwa Province", code: "SP" }, // Note: Code conflict with Southern, will handle
];

// Sri Lankan Districts Data (25 districts distributed across provinces)
const DISTRICTS = [
  // Western Province (3 districts)
  { name: "Colombo", code: "CO", provinceCode: "WP" },
  { name: "Gampaha", code: "GA", provinceCode: "WP" },
  { name: "Kalutara", code: "KA", provinceCode: "WP" },

  // Central Province (3 districts)
  { name: "Kandy", code: "KD", provinceCode: "CP" },
  { name: "Matale", code: "MA", provinceCode: "CP" },
  { name: "Nuwara Eliya", code: "NE", provinceCode: "CP" },

  // Southern Province (3 districts)
  { name: "Galle", code: "GL", provinceCode: "SP" },
  { name: "Matara", code: "MT", provinceCode: "SP" },
  { name: "Hambantota", code: "HB", provinceCode: "SP" },

  // Northern Province (2 districts)
  { name: "Jaffna", code: "JA", provinceCode: "NP" },
  { name: "Kilinochchi", code: "KI", provinceCode: "NP" },

  // Eastern Province (3 districts)
  { name: "Trincomalee", code: "TR", provinceCode: "EP" },
  { name: "Batticaloa", code: "BT", provinceCode: "EP" },
  { name: "Ampara", code: "AP", provinceCode: "EP" },

  // North Western Province (2 districts)
  { name: "Kurunegala", code: "KU", provinceCode: "NWP" },
  { name: "Puttalam", code: "PU", provinceCode: "NWP" },

  // North Central Province (2 districts)
  { name: "Anuradhapura", code: "AN", provinceCode: "NCP" },
  { name: "Polonnaruwa", code: "PO", provinceCode: "NCP" },

  // Uva Province (2 districts)
  { name: "Badulla", code: "BD", provinceCode: "UP" },
  { name: "Moneragala", code: "MO", provinceCode: "UP" },

  // Sabaragamuwa Province (3 districts)
  { name: "Ratnapura", code: "RA", provinceCode: "SBP" }, // SBP to avoid conflict
  { name: "Kegalle", code: "KE", provinceCode: "SBP" },
  { name: "Balangoda", code: "BL", provinceCode: "SBP" },
];

// Police Station Names (realistic Sri Lankan police station names)
const POLICE_STATION_NAMES = [
  "Central Police Station",
  "North Police Station",
  "South Police Station",
  "East Police Station",
  "West Police Station",
  "Main Police Station",
  "Divisional Police Station",
  "Traffic Police Station",
  "Highway Police Station",
  "Railway Police Station",
  "Harbor Police Station",
  "Airport Police Station",
  "Special Police Station",
  "Mobile Police Station",
  "Rural Police Station",
  "Urban Police Station",
  "Coastal Police Station",
  "Mountain Police Station",
  "Border Police Station",
  "Checkpoint Police Station",
];

// Sri Lankan location coordinates (approximate centers of major cities)
const DISTRICT_COORDINATES = {
  CO: [79.8612, 6.9271], // Colombo
  GA: [79.9937, 7.0873], // Gampaha
  KA: [79.9593, 6.5854], // Kalutara
  KD: [80.635, 7.2906], // Kandy
  MA: [80.6217, 7.4675], // Matale
  NE: [80.7672, 6.9497], // Nuwara Eliya
  GL: [80.21, 6.0329], // Galle
  MT: [80.5353, 5.9485], // Matara
  HB: [81.1185, 6.1246], // Hambantota
  JA: [80.005, 9.6615], // Jaffna
  KI: [80.3982, 9.3803], // Kilinochchi
  TR: [81.2335, 8.5874], // Trincomalee
  BT: [81.6937, 7.73], // Batticaloa
  AP: [81.653, 7.3018], // Ampara
  KU: [80.3623, 7.4863], // Kurunegala
  PU: [79.8283, 8.0362], // Puttalam
  AN: [80.4037, 8.3114], // Anuradhapura
  PO: [81.0, 7.9333], // Polonnaruwa
  BD: [81.0557, 6.9934], // Badulla
  MO: [81.3484, 6.7525], // Moneragala
  RA: [80.4037, 6.7056], // Ratnapura
  KE: [80.3464, 7.2513], // Kegalle
  BL: [80.7047, 6.6609], // Balangoda
};

// Vehicle colors
const VEHICLE_COLORS = [
  "White",
  "Black",
  "Silver",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Purple",
  "Brown",
  "Cream",
  "Maroon",
  "Navy Blue",
  "Teal",
];

// Sri Lankan names for drivers
const DRIVER_FIRST_NAMES = [
  "Amal",
  "Nimal",
  "Kamal",
  "Sunil",
  "Ranil",
  "Chaminda",
  "Dinesh",
  "Lalith",
  "Mahesh",
  "Pradeep",
  "Rohan",
  "Saman",
  "Tharindu",
  "Upul",
  "Vijay",
  "Anura",
  "Bandula",
  "Chandana",
  "Damith",
  "Eranga",
  "Fazal",
  "Gamini",
  "Harsha",
  "Indika",
  "Jagath",
  "Kapila",
  "Lakmal",
  "Mohan",
  "Nishan",
];

const DRIVER_LAST_NAMES = [
  "Perera",
  "Fernando",
  "Silva",
  "Bandara",
  "Jayawardena",
  "Gunawardena",
  "Wickramasinghe",
  "Rajapaksa",
  "Sirisena",
  "Cooray",
  "De Silva",
  "Abeysinghe",
  "Weerasinghe",
  "Jayasinghe",
  "Kumara",
  "Ratnayake",
  "Samarasinghe",
  "Dissanayake",
  "Senanayake",
  "Liyanage",
  "Herath",
  "Ekanayake",
  "Mendis",
  "Fonseka",
  "Ranaweera",
];

// Generate random Sri Lankan phone number
const generatePhoneNumber = () => {
  const prefixes = ["070", "071", "072", "075", "076", "077", "078"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");
  return `${prefix}${number}`;
};

// Generate Sri Lankan driving license number
const generateLicenseNumber = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const numbers = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");
  return `${letter1}${letter2}${numbers}`;
};

// Generate Sri Lankan vehicle registration number
const generateRegistrationNumber = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const districtCodes = ["WP", "CP", "SP", "NP", "EP", "NW", "NC", "UV", "SB"];
  const district =
    districtCodes[Math.floor(Math.random() * districtCodes.length)];
  const number = Math.floor(Math.random() * 9999) + 1;
  return `${district}-${number.toString().padStart(4, "0")}`;
};

// Generate device ID
const generateDeviceId = () => {
  const prefix = "TK";
  const number = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `${prefix}${number}`;
};

// Generate random date within last N days
const generateRandomDate = (daysBack = 7) => {
  const now = new Date();
  const daysAgo = new Date(
    now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000,
  );
  return daysAgo;
};

// Generate random coordinates around a center point
const generateNearbyCoordinates = (centerLat, centerLng, radiusKm = 5) => {
  // Convert km to degrees (approximate)
  const radiusDegrees = radiusKm / 111.32;

  const lat = centerLat + (Math.random() - 0.5) * 2 * radiusDegrees;
  const lng = centerLng + (Math.random() - 0.5) * 2 * radiusDegrees;

  return [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))];
};

module.exports = {
  PROVINCES,
  DISTRICTS,
  POLICE_STATION_NAMES,
  DISTRICT_COORDINATES,
  VEHICLE_COLORS,
  DRIVER_FIRST_NAMES,
  DRIVER_LAST_NAMES,
  generatePhoneNumber,
  generateLicenseNumber,
  generateRegistrationNumber,
  generateDeviceId,
  generateRandomDate,
  generateNearbyCoordinates,
};
