const express = require('express');
const router = express.Router();

// Import individual auth routes
const authRoutes = require('./auth');
const registerRoutes = require('./register');
const forgotPasswordRoutes = require('./forgotPassword');
const otpRoutes = require('./matchOTP');
const passwordResetRoutes = require('./passwordReset');
const oauthRoutes = require('./oauth');
const logoutRoutes = require('./logout');
const refreshRoutes = require('./refresh');

// Mount auth routes
router.use('/login', authRoutes);
router.use('/register', registerRoutes);
router.use('/forgot-password', forgotPasswordRoutes);
router.use('/verify-otp', otpRoutes);
router.use('/reset-password', passwordResetRoutes);
router.use('/oauth', oauthRoutes);
router.use('/logout', logoutRoutes);
router.use('/refresh', refreshRoutes);

module.exports = router;
