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
  password: {
    type: String,
    minlength: 8,
  },
  rollNumber:{
    type:Number,
  },
  batchNumber:{
    type:Number,
  },
  progressStatus:{
    type:String,
    default:'00-0.0',
  },
  photo: String,
  phoneNumber: {
    type: String,
  },
  program: {
    type: Number,
  },
  role: {
   type:[Number],
  },
  refreshToken: {
    type: String,
  },
  OTP:String,
});

module.exports = mongoose.model("Student", studentSchema);
