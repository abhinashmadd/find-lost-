const net = require("net");
const mongoose = require("mongoose");
const localDb = require("./localDb");

let isMongoConnected = false;

// Quick helper to check if a local port is listening (resolves in ~50ms)
const isPortOpen = (host, port) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

// Connect to MongoDB or seamlessly use the built-in standalone database
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || "";

  // 1. If no URI or explicitly marked for local DB
  if (!uri || uri === "local" || process.env.USE_LOCAL_DB === "true") {
    console.log("⚡ Standalone Local DB mode active (No MongoDB required).");
    console.log("📁 Data saved in server/data/*.json");
    await localDb.init();
    return;
  }

  // 2. If pointing to localhost / 127.0.0.1, check if mongod is actually listening first
  if (uri.includes("127.0.0.1") || uri.includes("localhost")) {
    const portMatch = uri.match(/:(\d+)/);
    const port = portMatch ? parseInt(portMatch[1], 10) : 27017;
    const host = uri.includes("127.0.0.1") ? "127.0.0.1" : "localhost";

    const isOpen = await isPortOpen(host, port);
    if (!isOpen) {
      console.log("⚠️ Local MongoDB service not detected on your PC.");
      console.log("⚡ Seamlessly switched to Built-in Standalone Database (No MongoDB required)!");
      console.log("📁 Data will be safely persisted in server/data/*.json");
      await localDb.init();
      return;
    }
  }

  // 3. Connect to MongoDB (local or Atlas)
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("⚠️ MongoDB connection failed. Falling back to Standalone Database.");
    await localDb.init();
  }
};

const getIsMongoConnected = () => isMongoConnected;

module.exports = { connectDB, getIsMongoConnected };
