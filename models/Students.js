const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
/**
 * @openapi
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - fullname
 *         - email
 *         - phoneNumber
 *         - program
 *         - password
 *         - confirmPassword
 *       properties:
 *         fullname:
 *           type: string
 *           default: "Ram Kumar"
 *         email:
 *           type: string
 *           default: "example.123454@ncit.edu.np"
 *         phoneNumber:
 *           type: string
 *           default: "9874451256"
 *         program:
 *           type: string
 *           default: "700"
 *         password:
 *           type: string
 *           default: "Password@123"
 *         confirmPassword:
 *           type: string
 *           default: "Password@123"
 */

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
      default: "0000",
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
    },
    OTP: String,
    timeStamps: {
      type: Date,
      timestamps: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
