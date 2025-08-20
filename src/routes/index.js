const express = require('express');
const router = express.Router();
const rateLimit = require("express-rate-limit");
const verifyJWT = require("../middleware/auth/verifyJWT");

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    error: "Too many login attempts, please try again later."
  },
  skipSuccessfulRequests: true,
});

// Import route modules
const rootRoutes = require('./root');

// Public routes
router.use("/", rootRoutes);

// Authentication routes with rate limiting
router.use("/api/register", authLimiter, require("./auth/register"));
router.use("/api/oauth/google", authLimiter, require("./auth/oauth"));
router.use("/api/auth", authLimiter, require("./auth/auth"));
router.use("/api/refresh", require("./auth/refresh"));
router.use("/api/forgotPassword/email", authLimiter, require("./auth/forgotPassword"));
router.use("/api/logout", require("./auth/logout"));
router.use("/api/forgotPassword/OTP", authLimiter, require("./auth/matchOTP"));
router.use("/api/forgotPassword/password", authLimiter, require("./auth/passwordReset"));

// JWT verification middleware for protected routes
router.use(verifyJWT);

// Protected API routes
router.use("/api/user", require("./api/getUserInformation"));
router.use("/api/event", require("./api/events"));
router.use("/api/evaluator", require("./api/evaluators"));
router.use("/api/student", require("./api/students"));
router.use("/api/supervisor", require("./api/supervisors"));

module.exports = router;
