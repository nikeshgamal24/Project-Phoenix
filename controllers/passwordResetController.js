const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const roleList = require("../config/roleList");
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const Supervisor = require("../models/Supervisor");
require("dotenv").config();
const { createAccessToken } = require("./createSetTokens/createAccessToken");

const passwordReset = async (req, res) => {
  console.log(req.body);
  const {password } = req.body;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //Unauthorized

  const accessToken = authHeader.split(" ")[1];
  // const accessToken = token;
  if (!accessToken || !password)
    return res.status(401).json({
      message: "Unauthorized User",
    });

  // verify token and save new hashedPassword to db
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, decoded) => {

      if (err || !decoded.UserInfo.email)
        return res.sendStatus(403).send("Forbidden");

      const currentUserEmail = decoded.UserInfo.email;
      const role = decoded.UserInfo.role;

      try {
        // check for user found or not
        let foundUser;
        if (role.includes(roleList.Student)) {
          foundUser = await Student.findOne({
            email: currentUserEmail,
            role: { $in: [role] },
          }).exec();
        } else if (role.includes(roleList.Supervisor)) {
          foundUser = await Supervisor.findOne({
            email: currentUserEmail,
            role: { $in: [role] },
          }).exec();
        } else if (role.includes(roleList.Admin)) {
          foundUser = await Admin.findOne({
            email: currentUserEmail,
            role: { $in: [role] },
          }).exec();
        } else {
          return res.sendStatus(401);
        }

        if (!foundUser) return res.sendStatus(404).send("User not found");

        //when otp is match
        //create access token from refresh token
        const accessToken = createAccessToken(foundUser,role,process.env.OTP_ACCESS_TOKEN_EXPIRATION_TIME);

        if (!accessToken) return res.status(400).send("Access Token creation fail");

        //hash new password
        const newHashedPassword = await bcrypt.hash(password, 10);
        foundUser.password = newHashedPassword;
        foundUser.OTP = "";
        const updatedUser = await foundUser.save();
        updatedUser.password = undefined;
        updatedUser.refreshToken = undefined;
        return res.status(200).json({
          user: updatedUser,
        });
      } catch (err) {
        console.error(`"error-message":${err.message}`);
        return res.sendStatus(400);
      }
    }
  );
};

module.exports = { passwordReset };
