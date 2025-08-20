// src/config/database.js
const mongoose = require("mongoose");

const connectDB = async () =>{
  const {
    DATABASE_URI,
    NODE_ENV = "development",
  } = process.env;

  if (!DATABASE_URI) {
    throw new Error("DATABASE_URI is not set");
  }

  // Global Mongoose settings
  mongoose.set("strictQuery", NODE_ENV !== "development");     // safer in prod
  mongoose.set("autoIndex", NODE_ENV === "development");        // build indexes explicitly in prod
  // mongoose.set("autoCreate", NODE_ENV === "development");    // optional

  const opts = {
    // Pooling
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30_000,

    // Timeouts
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,

    // Compression (match your cluster support)
    compressors: "zlib",

    // Read preference (primary for consistent reads)
    readPreference: "primary",

    // NOTE:
    // - useNewUrlParser/useUnifiedTopology are defaults in Mongoose 6+ (omit)
    // - retryWrites should be set in the URI (recommended)
    // - readConcern/writeConcern best set in URI or per-operation
  };

  // Connection events (set up before connecting)
  mongoose.connection.on("connected", () => {
    console.log("🔗 Mongoose connected");
  });
  mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err);
  });
  mongoose.connection.on("disconnected", () => {
    console.log("🔌 Mongoose disconnected");
  });

  // Graceful shutdown handlers
  const shutdown = async (signal) => {
    try {
      await mongoose.connection.close();
      console.log(`🛑 Mongoose closed on ${signal}`);
      process.exit(0);
    } catch (err) {
      console.error("❌ Error closing Mongoose:", err);
      process.exit(1);
    }
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Attempt connection
  try {
    const conn = await mongoose.connect(DATABASE_URI, opts);
    console.log("✅ Connected to MongoDB Successfully");
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
}

module.exports = connectDB;
