const Student = require("../../models/user/Student");
const Supervisor = require("../../models/user/Supervisor");
const Admin = require("../../models/user/Admin");
const bcrypt = require("bcryptjs");
const roleList = require("../../config/constants/roles");
const { AppError } = require("../../middleware/errorHandler");
const {
  extractRollAndBatch,
} = require("../helpers/validation/extractRollAndBatch");
const {
  initializeProgressStatus,
} = require("../helpers/project/initializeProgressStatus");

const handleNewUser = async (req, res, next) => {
  try {
    const { fullname, email, photo, password, phoneNumber, program, role, designation, institution } = req.body;

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

    // Check for duplicate email across all user types
    const normalizedEmail = email.toLowerCase();
    const duplicate = await UserModel.findOne({ email: normalizedEmail }).exec();

    if (duplicate) {
      return next(new AppError('Email already exists', 409));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    let userData = {
      fullname,
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
      role: [role],
      photo
    };

    // Role-specific data preparation
    if (role === roleList.Student) {
      // Extract roll number and batch number from email
      const { rollNo, batchNo } = extractRollAndBatch(email);
      
      // Determine progress status based on batch
      const progressStatus = initializeProgressStatus(batchNo);

      userData = {
        ...userData,
        rollNumber: rollNo,
        batchNumber: batchNo,
        program,
        progressStatus,
        isAssociated: false,
      };
    } else if (role === roleList.Supervisor) {
      userData = {
        ...userData,
        designation,
        institution,
        skillSet: [],
        isAvailable: true
      };
    }

    // Create user
    const newUser = await UserModel.create(userData);

    // Prepare response (exclude sensitive data)
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Send response
    res.status(201).json({
      status: 'success',
      message: `New ${role === roleList.Student ? 'student' : role === roleList.Supervisor ? 'supervisor' : 'admin'} ${fullname} has been created successfully!`,
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    // Handle duplicate key error from MongoDB
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return next(new AppError(`${field} already exists`, 409));
    }
    
    next(error);
  }
};

module.exports = { handleNewUser };
