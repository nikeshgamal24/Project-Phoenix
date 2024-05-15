const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const teacherSchema = new Schema({
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
    required: [true, "Please provide a password!"],
    minlength: 8,
  },
  phoneNumber: {
    type: String,
    required: [true, "Please enter your phone number!"],
  },
  role: {
    type:[Number],
  },
  refreshToken: {
    type: String,
  },
  OTP:String,
  timeStamps: {
    type: Date,
    timestamps: true,
},
}, {
timestamps: true,
});


module.exports = mongoose.model("Teacher", teacherSchema);

