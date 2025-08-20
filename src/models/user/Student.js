const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const studentSchema = new Schema(
  {
    fullname: {
      type: String,
      required: [true, "Please, Enter your full name!"],
    },
    email: {
      type: String,
      required: [true, "Please your calid email address!"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email!!!"],
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // Don't include password in queries by default
    },
    rollNumber: {
      type: Number,
    },
    batchNumber: {
      type: Number,
    },
    isAssociated: {
      type: Boolean,
      default: false,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    progressStatus: {
      type: String,
    },
    photo: String,
    phoneNumber: {
      type: String,
    },
    program: {
      type: Number,
    },
    role: {
      type: [Number],
    },
    refreshToken: {
      type: String,
      select: false, // Don't include refresh token in queries by default
    },
    OTP: {
      type: String,
      select: false, // Don't include OTP in queries by default
    },
    timeStamps: {
      type: Date,
      timestamps: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
studentSchema.index({ rollNumber: 1, batchNumber: 1 }); // Compound index for roll and batch
studentSchema.index({ program: 1 }); // Index for program queries
studentSchema.index({ isAssociated: 1 }); // Index for association status
studentSchema.index({ progressStatus: 1 }); // Index for progress status
studentSchema.index({ role: 1 }); // Index for role-based queries

module.exports = mongoose.model("Student", studentSchema);
