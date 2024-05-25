const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please your cvalid email address!"],
      unique:true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email!!!"],
    },
    fullname: {
      type: String,
      required: [true, "Please, Enter your full name!"],
    },
    photo: String,
    phoneNumber: {
      type: String,
    },
    role: {
      type: [Number],
    },
    password: {
      type: String,
    },
    refreshToken: String,
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

module.exports = mongoose.model("Admin", adminSchema);
