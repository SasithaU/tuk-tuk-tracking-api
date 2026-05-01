/**
 * Database Configuration
 * MongoDB connection setup and configuration
 */

require("dotenv").config();

const mongoose = require("mongoose");

// Database configuration
const DB_CONFIG = {
  HOST: process.env.DB_HOST || "localhost",
  PORT: process.env.DB_PORT || 27017,
  NAME: process.env.DB_NAME || "tuk_tuk_tracking",
  USERNAME: process.env.DB_USERNAME || "",
  PASSWORD: process.env.DB_PASSWORD || "",
};

// Connection URL
const getConnectionURL = () => {
  const { HOST, PORT, NAME, USERNAME, PASSWORD } = DB_CONFIG;

  if (USERNAME && PASSWORD) {
    return `mongodb://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/${NAME}?authSource=admin`;
  }

  return `mongodb://${HOST}:${PORT}/${NAME}`;
};

// Connection options
const CONNECTION_OPTIONS = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionURL = getConnectionURL();

    console.log("🔌 Connecting to MongoDB...");
    console.log(
      `📍 Connection URL: ${connectionURL.replace(/:[^:]*@/, ":****@")}`,
    ); // Hide password in logs

    const conn = await mongoose.connect(connectionURL, CONNECTION_OPTIONS);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("⚠️  Server will continue without database connection");
    console.log(
      "💡 To enable database features, start MongoDB and restart the server",
    );
    // Don't exit process - allow server to run without DB for development
    return null;
  }
};

// Close database connection
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error.message);
  }
};

// Health check
const healthCheck = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return {
      status: states[state] || "unknown",
      database: mongoose.connection.name || "none",
      host: mongoose.connection.host || "none",
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
    };
  }
};

module.exports = {
  connectDB,
  closeDB,
  healthCheck,
  DB_CONFIG,
};
