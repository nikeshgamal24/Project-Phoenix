require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const cors = require("cors");
const corsOptions = require("./src/config/corsOptions");
const { errorHandler } = require("./src/middleware/errorHandler");
const verifyJWT = require("./src/middleware/auth/verifyJWT");
const cookieParser = require("cookie-parser");
// const { logger } = require("./src/middleware/logging/logEvents");
const credentials = require("./src/middleware/security/credentials");
const mongoose = require("mongoose");
const connectDB = require("./src/config/database");
// const { swaggerDocs } = require("./src/config/swagger");

// Configuration
const PORT = process.env.PORT || 3500;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express app
const app = express();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    error: "Too many login attempts, please try again later."
  },
  skipSuccessfulRequests: true,
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});


// Security middleware (should be early in the middleware stack)
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));

// Apply rate limiting to all requests
app.use(limiter);

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Middleware for access-control-allow credentials
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb' // Add size limit for security
}));

app.use(express.json({ 
  limit: '10mb' // Add size limit for security
}));

// Cookie parser middleware
app.use(cookieParser());

// Custom logger middleware (enable in development)
// if (NODE_ENV === 'development') {
//   app.use(logger);

// }

// Serve static files
// app.use(express.static(path.join(__dirname, "/public")));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// API Documentation
// swaggerDocs(app, PORT);

// Import all routes
const routes = require("./src/routes");

// Use centralized routing
app.use("/", routes);

// 404 handler for undefined routes
app.all("*", (req, res) => {
  const error = {
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
    timestamp: new Date().toISOString()
  };

  res.status(404);
  
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json(error);
  } else {
    res.type("txt").send("404 NOT FOUND");
  }
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server startup
mongoose.connection.once("open", () => {
  console.log("✅ Server: MongoDB connection established");
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
    // console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/api-docs`);
    console.log(`💓 Health Check: http://localhost:${PORT}/api/health`);
  });

  // Handle server errors
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
});
