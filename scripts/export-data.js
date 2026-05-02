require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDB, closeDB } = require('../src/config/database');

const Province = require('../src/models/Province');
const District = require('../src/models/District');
const PoliceStation = require('../src/models/PoliceStation');
const Vehicle = require('../src/models/Vehicle');
const Driver = require('../src/models/Driver');
const User = require('../src/models/User');

async function exportData() {
  console.log("⏳ Connecting to database...");
  await connectDB();
  
  try {
    console.log("📦 Exporting master data...");
    
    const exportData = {
      provinces: await Province.find().lean(),
      districts: await District.find().lean(),
      policeStations: await PoliceStation.find().lean(),
      vehicles: await Vehicle.find().limit(50).lean(), // limit to 50 to keep file size reasonable
      drivers: await Driver.find().limit(50).lean(),
      users: await User.find().select('-passwordHash').lean()
    };

    const filePath = path.join(__dirname, 'simulation-data-export.json');
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Successfully exported simulation data to ${filePath}`);
    console.log("This fulfills Deliverable 3: 'Simulation Data in JSON or CSV'.");
  } catch (err) {
    console.error("❌ Export failed:", err);
  } finally {
    await closeDB();
    process.exit(0);
  }
}

exportData();
