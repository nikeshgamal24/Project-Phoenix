const roleList = require("../config/roleList");
const Admin = require("../models/Admins");
const Student = require("../models/Students");
const Teacher = require("../models/Teachers");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { searchUser } = require("./verifyEmails/searchUser");

function generateOTP() {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp;
}

const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  //check for email and role
  if (!email || !role) return res.sendStatus(400);

  // check for user found or not
  let foundUser;
  switch (role) {
    case roleList.Student:
      foundUser = await searchUser(Student, email, role);
      break;
    case roleList.Supervisor:
      foundUser = await searchUser(Teacher, email, role);
      break;
    case roleList.Admin:
      foundUser = await searchUser(Admin, email, role);
      break;
    default:
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
    const accessToken = createAccessToken(
      foundUser,
      role,
      process.env.ACCESS_TOKEN_EXPIRATION_TIME
    );

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
