const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const studentSchema = new Schema({
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
    minlength: 8,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter your phone number!"],
  },
  program: {
    type: String,
    enum: ["BESE", "BEIT", "BECE", "BCA", "BEELX"],
  },
  role: {
   type:[Number],
  },
  refreshToken: {
    type: String,
  },
});

module.exports = mongoose.model("Student", studentSchema);
