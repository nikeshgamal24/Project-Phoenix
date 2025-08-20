const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const roleList = require("../../config/constants/roles");
const Student = require("../../models/user/Student");
const Admin = require("../../models/user/Admin");
const Supervisor = require("../../models/user/Supervisor");
const { AppError } = require("../../middleware/errorHandler");
const { createAccessToken } = require("../helpers/auth/createAccessToken");

// Rate limiting for OTP verification attempts
const otpAttempts = new Map();
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

const matchOTP = async (req, res, next) => {
  try {
    const { OTP } = req.body;

    // Extract and validate access token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new AppError('Authorization header required', 401));
    }

    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      return next(new AppError('Access token required', 401));
    }

    // Verify JWT token
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    if (!decoded?.UserInfo?.email) {
      return next(new AppError('Invalid access token', 403));
    }

    const currentUserEmail = decoded.UserInfo.email;
    const role = decoded.UserInfo.role;

    // Rate limiting per email
    const attemptKey = currentUserEmail;
    const attemptData = otpAttempts.get(attemptKey);

    if (attemptData && attemptData.count >= MAX_OTP_ATTEMPTS) {
      const timeLeft = attemptData.lockedUntil - Date.now();
      if (timeLeft > 0) {
        return next(new AppError(
          `Too many OTP verification attempts. Try again in ${Math.ceil(timeLeft / 60000)} minutes.`,
          429
        ));
      } else {
        // Reset attempts after lockout period
        otpAttempts.delete(attemptKey);
      }
    }

    // Get user model based on role
    const getUserModel = (roles) => {
      if (roles.includes(roleList.Student)) return Student;
      if (roles.includes(roleList.Supervisor)) return Supervisor;
      if (roles.includes(roleList.Admin)) return Admin;
      return null;
    };

    const UserModel = getUserModel(role);
    if (!UserModel) {
      return next(new AppError('Invalid user role', 400));
    }

    // Find user with OTP field
    const foundUser = await UserModel.findOne({
      email: currentUserEmail,
      role: { $in: role },
    }).select('+OTP +otpExpiration').exec();

    if (!foundUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if OTP exists
    if (!foundUser.OTP) {
      return next(new AppError('No OTP found. Please request a new one.', 400));
    }

    // Check if OTP has expired
    if (foundUser.otpExpiration && foundUser.otpExpiration < new Date()) {
      // Clear expired OTP
      foundUser.OTP = undefined;
      foundUser.otpExpiration = undefined;
      await foundUser.save();
      
      return next(new AppError('OTP has expired. Please request a new one.', 400));
    }

    // Verify OTP
    const otpMatch = await bcrypt.compare(OTP, foundUser.OTP);

    // Track failed attempts
    if (!otpMatch) {
      const currentAttempts = attemptData ? attemptData.count + 1 : 1;
      
      if (currentAttempts >= MAX_OTP_ATTEMPTS) {
        otpAttempts.set(attemptKey, {
          count: currentAttempts,
          lockedUntil: Date.now() + OTP_LOCKOUT_DURATION
        });
        return next(new AppError(
          `Too many failed OTP attempts. Account locked for ${OTP_LOCKOUT_DURATION / 60000} minutes.`,
          429
        ));
      } else {
        otpAttempts.set(attemptKey, {
          count: currentAttempts,
          lockedUntil: 0
        });
        return next(new AppError(`Invalid OTP. ${MAX_OTP_ATTEMPTS - currentAttempts} attempts remaining.`, 401));
      }
    }

    // OTP verified successfully - clear OTP and attempts
    foundUser.OTP = undefined;
    foundUser.otpExpiration = undefined;
    await foundUser.save();
    
    // Clear rate limiting attempts on success
    otpAttempts.delete(attemptKey);

    // Create new access token for password reset
    const newAccessToken = createAccessToken(
      foundUser,
      role,
      process.env.PASSWORD_RESET_TOKEN_EXPIRATION_TIME || '15m'
    );

    if (!newAccessToken) {
      return next(new AppError('Failed to create access token', 500));
    }

    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully',
      data: {
        accessToken: newAccessToken,
        expiresIn: '15 minutes'
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token', 403));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired. Please request a new OTP.', 403));
    }
    next(error);
  }
};

module.exports = { matchOTP };