const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const supervisorSchema = new Schema(
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
    photo: String,
    password: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please enter your phone number!"],
    },
    role: {
      type: [Number],
    },
    designation: {
      type: String,
    },
    institution: {
      type: String,
    },
    skillSet: {
      type: [String],
    },
    refreshToken: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
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

module.exports = mongoose.model("Supervisor", supervisorSchema);
