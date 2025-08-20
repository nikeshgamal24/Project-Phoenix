const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const roleList = require("../../config/constants/roles");
const Student = require("../../models/user/Student");
const Admin = require("../../models/user/Admin");
const Supervisor = require("../../models/user/Supervisor");
const { AppError } = require("../../middleware/errorHandler");

const passwordReset = async (req, res, next) => {
  try {
    const { password, confirmPassword } = req.body;

    // Validate password confirmation
    if (password !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }

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

    // Find user
    const foundUser = await UserModel.findOne({
      email: currentUserEmail,
      role: { $in: role },
    }).select('+password').exec();

    if (!foundUser) {
      return next(new AppError('User not found', 404));
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(password, foundUser.password);
    if (isSamePassword) {
      return next(new AppError('New password must be different from current password', 400));
    }

    // Hash new password with higher salt rounds for security
    const newHashedPassword = await bcrypt.hash(password, 12);
    
    // Update password and clear any remaining OTP/reset tokens
    foundUser.password = newHashedPassword;
    foundUser.OTP = undefined;
    foundUser.otpExpiration = undefined;
    foundUser.refreshToken = undefined; // Force re-login for security
    
    await foundUser.save();

    // Log successful password reset (for security monitoring)
    console.log(`Password reset successful for user: ${currentUserEmail} at ${new Date().toISOString()}`);

    // Send success response (don't include user data)
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. Please login with your new password.'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token', 403));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Reset token expired. Please request a new password reset.', 403));
    }
    next(error);
  }
};

module.exports = { passwordReset };