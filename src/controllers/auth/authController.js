const Student = require("../../models/user/Student");
const Supervisor = require("../../models/user/Supervisor");
const Admin = require("../../models/user/Admin");
const Evaluator = require("../../models/user/Evaluator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const roleList = require("../../config/constants/roles");
const tokenService = require("../../services/auth/tokenService");
const { AppError } = require("../../middleware/errorHandler");

const handleLogin = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Get user model based on role
    const getUserModel = (role) => {
      switch (role) {
        case roleList.Student:
          return Student;
        case roleList.Supervisor:
          return Supervisor;
        case roleList.Admin:
          return Admin;
        default:
          return null;
      }
    };

    const UserModel = getUserModel(role);
    if (!UserModel) {
      return next(new AppError('Invalid role specified', 400));
    }

    // Find user by email and role
    const foundUser = await UserModel.findOne({
      email: email.toLowerCase(),
      role: { $in: [role] },
    }).select('+password').exec();

    if (!foundUser) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Get user roles
    const userRoles = Object.values(foundUser.role);

    // Create tokens using token service
    const accessToken = tokenService.createAccessToken(
      foundUser,
      userRoles,
      process.env.ACCESS_TOKEN_EXPIRATION_TIME
    );

    const refreshToken = tokenService.createRefreshToken(
      foundUser,
      process.env.REFRESH_TOKEN_EXPIRATION_TIME
    );

    // Save refresh token and update user
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Set refresh token in cookie
    tokenService.setCookie(res, refreshToken);

    // Prepare user response (exclude sensitive data)
    const userResponse = foundUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;
    delete userResponse.OTP;

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        user: userResponse,
      },
    });

  } catch (error) {
    next(error);
  }
};

const handleEvaluatorLogin = async (req, res, next) => {
  try {
    const { accessCode, role } = req.body;

    // Find evaluators with the specified role
    const evaluators = await Evaluator.find({ role }).exec();

    if (!evaluators || evaluators.length === 0) {
      return next(new AppError('No evaluators found for this role', 404));
    }

    let foundUser = null;
    let currentDefenseId = null;

    // Search for evaluator with matching access code
    evaluatorLoop: for (const evaluator of evaluators) {
      for (const defenseObj of evaluator.defense) {
        if (defenseObj.accessCode) {
          const isAccessCodeValid = await bcrypt.compare(
            accessCode,
            defenseObj.accessCode
          );

          if (isAccessCodeValid) {
            foundUser = evaluator;
            currentDefenseId = defenseObj.defenseId;
            break evaluatorLoop;
          }
        }
      }
    }

    if (!foundUser) {
      return next(new AppError('Invalid access code', 401));
    }

    // Get user roles
    const userRoles = Object.values(foundUser.role);

    // Create tokens using token service
    const accessToken = tokenService.createAccessToken(
      foundUser,
      userRoles,
      process.env.ACCESS_TOKEN_EXPIRATION_TIME
    );

    const refreshToken = tokenService.createRefreshToken(
      foundUser,
      process.env.REFRESH_TOKEN_EXPIRATION_TIME
    );

    // Update evaluator with current defense and refresh token
    foundUser.currentDefense = currentDefenseId;
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Set refresh token in cookie
    tokenService.setCookie(res, refreshToken);

    // Prepare user response (exclude sensitive data)
    const userResponse = foundUser.toObject();
    delete userResponse.refreshToken;
    
    // Remove access codes from defense objects
    if (userResponse.defense) {
      userResponse.defense.forEach(defenseObj => {
        delete defenseObj.accessCode;
      });
    }

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Evaluator login successful',
      data: {
        accessToken,
        user: userResponse,
      },
    });

  } catch (error) {
    next(error);
  }
};
module.exports = { handleLogin, handleEvaluatorLogin };
