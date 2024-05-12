const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const roleList = require("../config/roleList");
const Student = require("../models/Students");
const Admin = require("../models/Admins");
const Teacher = require("../models/Teachers");

const passwordReset = async (req, res) => {
  console.log(req.body);
  const { email, role, OTP, password } = req.body;

  if (!email || !role || !OTP || !password)
    return res.status(400).json({
      message: "Username and password are required to login!",
    });

  try {
    // check for user found or not
    let foundUser;

    //if otpMatched
    if (role === roleList.Student) {
      foundUser = await Student.findOne({
        email: email,
        role: { $in: [role] },
      }).exec();
    } else if (role === roleList.Supervisor || role === roleList.Defense) {
      foundUser = await Teacher.findOne({
        email: email,
        role: { $in: [role] },
      }).exec();
    } else if (role === roleList.Admin) {
      foundUser = await Admin.findOne({
        email: email,
        role: { $in: [role] },
      }).exec();
    } else {
      return res.sendStatus(400);
    }

    if (!foundUser) return res.sendStatus(404).send("User not found");

    const otpMatch = await bcrypt.compare(OTP, foundUser.OTP);

    //otp is not matched
    if (!otpMatch) return res.sendStatus(401).send("Unauthorized User");

    //hash new password
    const newHashedPassword = await bcrypt.hash(password, 10);
    foundUser.password = newHashedPassword;
    foundUser.OTP = "";
    const updatedUser = await foundUser.save();
    foundUser.password = undefined;
    foundUser.refreshToken = undefined;
    foundUser.OTP = undefined;
    return res.status(200).json({
      user: updatedUser,
    });
  } catch (err) {
    console.error(`"error-message":${err.message}`);
    return res.sendStatus(400);
  }
};

module.exports = { passwordReset };
