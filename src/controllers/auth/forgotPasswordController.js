const roleList = require("../../config/constants/roles");
const Admin = require("../../models/user/Admin");
const Student = require("../../models/user/Student");
const Supervisor = require("../../models/user/Supervisor");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { AppError } = require("../../middleware/errorHandler");
const tokenService = require("../../services/auth/tokenService");
const otpService = require("../../services/auth/otpService");
const emailService = require("../../services/email/emailService");

// Generate cryptographically secure OTP
function generateSecureOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Rate limiting for password reset attempts (in-memory store - use Redis in production)
const resetAttempts = new Map();
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Check rate limiting
    const clientKey = `${req.ip}-${normalizedEmail}`;
    const attemptData = resetAttempts.get(clientKey);
    
    if (attemptData && attemptData.count >= MAX_ATTEMPTS) {
      const timeLeft = attemptData.lockedUntil - Date.now();
      if (timeLeft > 0) {
        return next(new AppError(
          `Too many password reset attempts. Try again in ${Math.ceil(timeLeft / 60000)} minutes.`,
          429
        ));
      } else {
        // Reset attempts after lockout period
        resetAttempts.delete(clientKey);
      }
    }

    // Get user model based on role
    const getUserModel = (role) => {
      switch (role) {
        case roleList.Student: return Student;
        case roleList.Supervisor: return Supervisor;
        case roleList.Admin: return Admin;
        default: return null;
      }
    };

    const UserModel = getUserModel(role);
    if (!UserModel) {
      return next(new AppError('Invalid role specified', 400));
    }

    // Find user (always respond with success for security)
    const foundUser = await UserModel.findOne({
      email: normalizedEmail,
      role: { $in: [role] },
    }).exec();

    // Always respond with success to prevent email enumeration
    // Even if user doesn't exist, we pretend to send OTP
    const responseMessage = 'If an account with that email exists, an OTP has been sent.';

    if (foundUser) {
      // Generate secure OTP using service
      const otpData = await otpService.generateOTPData(5); // 5 minutes expiry
      
      // Save OTP to database
      foundUser.OTP = otpData.hashedOtp;
      foundUser.otpExpiration = otpData.expirationTime;
      await foundUser.save();

      // Create temporary access token for OTP verification
      const accessToken = tokenService.createAccessToken(
        foundUser,
        foundUser.role,
        process.env.OTP_ACCESS_TOKEN_EXPIRATION_TIME || '10m'
      );

      // Send OTP via email using email service
      try {
        await emailService.sendOTPEmail(
          foundUser.email, 
          otpData.plainOtp, 
          foundUser.fullname
        );

        // Track attempt
        const currentAttempts = attemptData ? attemptData.count + 1 : 1;
        if (currentAttempts >= MAX_ATTEMPTS) {
          resetAttempts.set(clientKey, {
            count: currentAttempts,
            lockedUntil: Date.now() + LOCKOUT_DURATION
          });
        } else {
          resetAttempts.set(clientKey, {
            count: currentAttempts,
            lockedUntil: 0
          });
        }

        // Send response with access token for OTP verification
        res.status(200).json({
          status: 'success',
          message: responseMessage,
          data: {
            accessToken,
            expiresIn: '5 minutes'
          }
        });

      } catch (emailError) {
        // Don't expose email sending errors to client
        return next(new AppError('Failed to send reset email. Please try again later.', 500));
      }
    } else {
      // Simulate processing time to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      
      res.status(200).json({
        status: 'success',
        message: responseMessage
      });
    }

  } catch (error) {
    next(error);
  }
};

module.exports = { forgotPassword };