/**
 * Database Seeder
 * Populates the database with simulation data for Sri Lanka
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB, closeDB } = require("../config/database");

// Models
const Province = require("../models/Province");
const District = require("../models/District");
const PoliceStation = require("../models/PoliceStation");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const User = require("../models/User");
const LocationPing = require("../models/LocationPing");
const LastKnownLocation = require("../models/LastKnownLocation");

// Simulation data
const {
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
} = require("./simulationData");

/**
 * Seed Provinces
 */
const seedProvinces = async () => {
  console.log("🌍 Seeding provinces...");

  const provinces = PROVINCES.map((province) => ({
    name: province.name,
    code: province.code,
    description: `${province.name} in Sri Lanka`,
  }));

  await Province.insertMany(provinces);
  console.log(`✅ Seeded ${provinces.length} provinces`);
};

/**
 * Seed Districts
 */
const seedDistricts = async () => {
  console.log("🏛️ Seeding districts...");

  const provinces = await Province.find({});
  const provinceMap = {};
  provinces.forEach((p) => {
    provinceMap[p.code] = p._id;
  });

  const districts = DISTRICTS.map((district) => ({
    name: district.name,
    code: district.code,
    provinceId: provinceMap[district.provinceCode],
    description: `${district.name} District in Sri Lanka`,
  }));

  await District.insertMany(districts);
  console.log(`✅ Seeded ${districts.length} districts`);
};

/**
 * Seed Police Stations
 */
const seedPoliceStations = async () => {
  console.log("🚔 Seeding police stations...");

  const districts = await District.find({});
  const policeStations = [];

  for (const district of districts) {
    // Create 1-3 police stations per district
    const stationCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < stationCount; i++) {
      const stationName =
        POLICE_STATION_NAMES[
          Math.floor(Math.random() * POLICE_STATION_NAMES.length)
        ];
      const coordinates = DISTRICT_COORDINATES[district.code] || [
        79.8612, 6.9271,
      ]; // Default to Colombo

      // Generate coordinates near district center
      const [lng, lat] = generateNearbyCoordinates(
        coordinates[1],
        coordinates[0],
        2,
      );

      policeStations.push({
        name: `${district.name} ${stationName}`,
        code: `${district.code}${String(i + 1).padStart(2, "0")}`,
        districtId: district._id,
        location: {
          type: "Point",
          coordinates: [lng, lat],
        },
        contactNumber: generatePhoneNumber(),
        email: `police.${district.code.toLowerCase()}${i + 1}@police.gov.lk`,
        stationOfficer: `${DRIVER_FIRST_NAMES[Math.floor(Math.random() * DRIVER_FIRST_NAMES.length)]} ${DRIVER_LAST_NAMES[Math.floor(Math.random() * DRIVER_LAST_NAMES.length)]}`,
        address: `${district.name} Police Station, Sri Lanka`,
      });
    }
  }

  await PoliceStation.insertMany(policeStations);
  console.log(`✅ Seeded ${policeStations.length} police stations`);
};

/**
 * Seed Users
 */
const seedUsers = async () => {
  console.log("👥 Seeding users...");

  const policeStations = await PoliceStation.find({});
  const districts = await District.find({});
  const provinces = await Province.find({});

  const users = [
    // Admin user
    {
      username: "admin",
      email: "admin@police.gov.lk",
      passwordHash: "Admin@123", // Will be hashed by pre-save middleware
      role: "admin",
      isActive: true,
    },
  ];

  // Provincial admins (one per province)
  provinces.forEach((province, index) => {
    const district = districts.find(
      (d) => d.provinceId.toString() === province._id.toString(),
    );
    users.push({
      username: `provincial_admin_${province.code.toLowerCase()}`,
      email: `provincial.${province.code.toLowerCase()}@police.gov.lk`,
      passwordHash: "Provincial@123",
      role: "provincial_admin",
      assignedProvinceId: province._id,
      assignedDistrictId: district?._id,
      isActive: true,
    });
  });

  // Station officers (one per police station)
  policeStations.forEach((station, index) => {
    users.push({
      username: `officer_${station.code.toLowerCase()}`,
      email: `officer.${station.code.toLowerCase()}@police.gov.lk`,
      passwordHash: "Officer@123",
      role: "station_officer",
      assignedStationId: station._id,
      isActive: true,
    });
  });

  // Insert users one by one to trigger password hashing
  for (const userData of users) {
    const user = new User(userData);
    await user.save();
  }

  console.log(`✅ Seeded ${users.length} users`);
};

/**
 * Seed Drivers
 */
const seedDrivers = async () => {
  console.log("👨‍🚗 Seeding drivers...");

  const drivers = [];

  for (let i = 0; i < 200; i++) {
    const firstName =
      DRIVER_FIRST_NAMES[Math.floor(Math.random() * DRIVER_FIRST_NAMES.length)];
    const lastName =
      DRIVER_LAST_NAMES[Math.floor(Math.random() * DRIVER_LAST_NAMES.length)];

    drivers.push({
      name: `${firstName} ${lastName}`,
      licenseNumber: generateLicenseNumber(),
      contactNumber: generatePhoneNumber(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      dateOfBirth: new Date(
        1970 + Math.floor(Math.random() * 30),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      ),
      status: "active",
      licenseExpiryDate: new Date(
        Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000,
      ), // Random expiry within next year
    });
  }

  await Driver.insertMany(drivers);
  console.log(`✅ Seeded ${drivers.length} drivers`);
};

/**
 * Seed Vehicles
 */
const seedVehicles = async () => {
  console.log("🚗 Seeding vehicles...");

  const drivers = await Driver.find({});
  const vehicles = [];

  for (let i = 0; i < 200; i++) {
    const driver = drivers[i]; // Assign each vehicle to a driver

    vehicles.push({
      registrationNumber: generateRegistrationNumber(),
      deviceId: generateDeviceId(),
      driverId: driver._id,
      status: "active",
      color: VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)],
      manufacturerYear: 2015 + Math.floor(Math.random() * 9), // 2015-2023
      make: "Toyota",
      model: "HiAce",
      notes: `Tuk-tuk registered to ${driver.name}`,
    });
  }

  await Vehicle.insertMany(vehicles);
  console.log(`✅ Seeded ${vehicles.length} vehicles`);
};

/**
 * Seed Location History
 */
const seedLocationHistory = async () => {
  console.log("📍 Seeding location history...");

  const vehicles = await Vehicle.find({});
  const districts = await District.find({});

  const locationPings = [];
  const lastKnownLocations = [];

  // Generate 1 week of location history for each vehicle
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const vehicle of vehicles) {
    // Get random district for this vehicle
    const district = districts[Math.floor(Math.random() * districts.length)];
    const coordinates = DISTRICT_COORDINATES[district.code] || [
      79.8612, 6.9271,
    ];

    // Generate location pings every 5-15 minutes for the past week
    let currentTime = new Date(oneWeekAgo);

    while (currentTime < now) {
      const [lng, lat] = generateNearbyCoordinates(
        coordinates[1],
        coordinates[0],
        10,
      );

      locationPings.push({
        vehicleId: vehicle._id,
        latitude: lat,
        longitude: lng,
        timestamp: new Date(currentTime),
        accuracy: 5 + Math.random() * 15, // 5-20 meters
        speed: Math.random() * 60, // 0-60 km/h
        heading: Math.random() * 360,
        source: "GPS",
      });

      // Move time forward by 5-15 minutes
      currentTime = new Date(
        currentTime.getTime() + (5 + Math.random() * 10) * 60 * 1000,
      );
    }

    // Set last known location
    const lastPing = locationPings[locationPings.length - 1];
    lastKnownLocations.push({
      vehicleId: vehicle._id,
      latitude: lastPing.latitude,
      longitude: lastPing.longitude,
      timestamp: lastPing.timestamp,
      accuracy: lastPing.accuracy,
      speed: lastPing.speed,
      heading: lastPing.heading,
      source: lastPing.source,
    });
  }

  // Insert in batches to avoid memory issues
  const batchSize = 1000;
  for (let i = 0; i < locationPings.length; i += batchSize) {
    const batch = locationPings.slice(i, i + batchSize);
    await LocationPing.insertMany(batch);
    console.log(
      `📍 Inserted ${Math.min(i + batchSize, locationPings.length)}/${locationPings.length} location pings`,
    );
  }

  await LastKnownLocation.insertMany(lastKnownLocations);
  console.log(`✅ Seeded location history for ${vehicles.length} vehicles`);
  console.log(`📊 Total location pings: ${locationPings.length}`);
};

/**
 * Main seeding function
 */
const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");

    await connectDB();

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      Province.deleteMany({}),
      District.deleteMany({}),
      PoliceStation.deleteMany({}),
      User.deleteMany({}),
      Driver.deleteMany({}),
      Vehicle.deleteMany({}),
      LocationPing.deleteMany({}),
      LastKnownLocation.deleteMany({}),
    ]);
    console.log("✅ Cleared existing data\n");

    // Seed data in order
    await seedProvinces();
    await seedDistricts();
    await seedPoliceStations();
    await seedUsers();
    await seedDrivers();
    await seedVehicles();
    await seedLocationHistory();

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- 9 Provinces");
    console.log("- 25 Districts");
    console.log("- 20+ Police Stations");
    console.log("- 4+ Users (Admin, Provincial Admins, Station Officers)");
    console.log("- 200 Drivers");
    console.log("- 200 Vehicles");
    console.log("- 10,000+ Location Pings (1 week history)");

    console.log("\n🔐 Default Login Credentials:");
    console.log("Admin: admin / Admin@123");
    console.log("Provincial Admin: provincial_admin_wp / Provincial@123");
    console.log("Station Officer: officer_co01 / Officer@123");
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  } finally {
    await closeDB();
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDatabase,
  seedProvinces,
  seedDistricts,
  seedPoliceStations,
  seedUsers,
  seedDrivers,
  seedVehicles,
  seedLocationHistory,
};
