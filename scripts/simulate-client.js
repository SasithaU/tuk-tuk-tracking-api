const http = require('http');

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
const LOGIN_CREDS = { username: 'admin', password: 'Admin@123' };
const PING_INTERVAL_MS = 3000; // Send a ping every 3 seconds

// Simulation state
let authToken = '';
let vehicleId = '';
let currentLat = 6.9271; // Colombo
let currentLng = 79.8612;

// Helper to make HTTP POST requests
const postRequest = (endpoint, data, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          resolve(responseBody);
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
};

// Helper to make HTTP GET requests
const getRequest = (endpoint, token) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          resolve(responseBody);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
};

// Main execution
const startSimulation = async () => {
  console.log('🚀 Starting Tuk-Tuk Tracker Simulation Client');
  
  try {
    // 1. Login
    console.log(`\n🔐 Logging in as ${LOGIN_CREDS.username}...`);
    const loginRes = await postRequest('/auth/login', LOGIN_CREDS);
    
    if (!loginRes.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
    }
    
    authToken = loginRes.data.token;
    console.log('✅ Logged in successfully!');

    // 2. Fetch a vehicle
    console.log('\n🚗 Fetching vehicles to simulate...');
    const vehiclesRes = await getRequest('/vehicles?limit=1', authToken);
    
    if (!vehiclesRes.success || !vehiclesRes.data || vehiclesRes.data.length === 0) {
      throw new Error('No vehicles found in database. Did you run the seeder?');
    }
    
    const vehicle = vehiclesRes.data[0];
    vehicleId = vehicle._id;
    console.log(`✅ Selected Vehicle: ${vehicle.registrationNumber} (ID: ${vehicleId})`);

    // 3. Start Ping Loop
    console.log('\n📡 Starting real-time location pings...');
    console.log('Press Ctrl+C to stop.\n');
    
    setInterval(async () => {
      // Add a small random offset to simulate movement
      currentLat += (Math.random() - 0.5) * 0.001;
      currentLng += (Math.random() - 0.5) * 0.001;
      const speed = Math.floor(Math.random() * 40) + 10; // 10-50 km/h

      const pingData = {
        vehicleId,
        latitude: currentLat,
        longitude: currentLng,
        timestamp: new Date().toISOString(),
        accuracy: 10,
        speed: speed,
        heading: Math.floor(Math.random() * 360),
        source: 'GPS'
      };

      try {
        const pingRes = await postRequest('/locations/ping', pingData, authToken);
        if (pingRes.success) {
          console.log(`[${new Date().toLocaleTimeString()}] 📍 Ping Sent: Lat ${currentLat.toFixed(5)}, Lng ${currentLng.toFixed(5)} | Speed: ${speed}km/h`);
        } else {
          console.error(`❌ Ping Error:`, pingRes.error);
        }
      } catch (err) {
        console.error(`❌ Request Error:`, err.message);
      }
      
    }, PING_INTERVAL_MS);

  } catch (error) {
    console.error('\n❌ Simulation Error:', error.message);
  }
};

startSimulation();
