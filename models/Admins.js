const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require('validator');

const adminSchema = new Schema({
    email: {
        type: String,
        required: [true, "Please your calid email address!"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email!!!"],
      },
  fullname: {
    type:  String,
    required: [true, "Please, Enter your full name!"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter your phone number!"],
  },
  role: {
    type:[Number]
  },
  password: {
    type: String,
  },
  refreshToken: String,
});

module.exports = mongoose.model("Admin", adminSchema);