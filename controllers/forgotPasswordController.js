const roleList = require("../config/roleList");
const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Supervisor = require("../models/Supervisor");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { createAccessToken } = require("./createSetTokens/createAccessToken");

function generateOTP() {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  //check for email and role
  if (!email || !role) return res.sendStatus(400);

  let foundUser;
  if (role === roleList.Admin) {
    foundUser = await Admin.findOne({
      email: email,
      role: { $in: [role] },
    }).exec();
  } else if (role === roleList.Student) {
    foundUser = await Student.findOne({
      email: email,
      role: { $in: [role] },
    }).exec();
  } else if (role === roleList.Supervisor) {
    foundUser = await Supervisor.findOne({
      email: email,
      role: { $in: [role] },
    }).exec();
  } else {
    return res.sendStatus(400);
  }
  //404 status check
  if (!foundUser)
    return res
      .status(404)
      .send("User with provided credentials doesn't exists");

  // // Check if the email exists in your user database
  try {
    //generate OTP code
    const otpCode = generateOTP().toString();
    const hashedOTP = await bcrypt.hash(otpCode, 10);
    //save OTP code to the databse
    foundUser.OTP = hashedOTP;
    const resultUser = await foundUser.save();

    //create an access token to send to the client side
    const accessToken = createAccessToken(foundUser,foundUser.role,process.env.OTP_ACCESS_TOKEN_EXPIRATION_TIME);

    // Send the reset token to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    const mailOptions = {
      from: {
        name: "Project Phoenix",
        address: "nikesh.191624@ncit.edu.np",
      },
      to: foundUser.email,
      subject: "Password Reset OTP Code",
      text: `Please use this OTP code to reset your password. OTP code:${otpCode}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(500).send("Error sending email");
      } else {
        console.log(`Email sent: ${info.response}`);
        res.status(200).json({ accessToken });
      }
    });
  } catch (err) {
    console.error(`"error-message":${err.message}`);
    return res.sendStatus(400);
  }
};
module.exports = { forgotPassword };
