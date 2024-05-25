const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const roleList = require("../config/roleList");
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const Supervisor = require("../models/Supervisor");
require("dotenv").config();
const { createAccessToken } = require("./createSetTokens/createAccessToken");

//functions
const matchOTP = async (req, res) => {
  const { OTP } = req.body;

  // const authHeader = req.headers["authorization"];
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //Unauthorized
  const accessToken = authHeader.split(" ")[1];

  // const accessToken =token;
  if (!accessToken || !OTP) return res.sendStatus(401);

  //verify and decode access token and chech for the user
  //evaluate jwt for creating access token
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, decoded) => {
      if (err || !decoded.UserInfo.email || !OTP) return res.sendStatus(403);

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
          return res.sendStatus(400);
        }

        if (!foundUser) return res.sendStatus(404);

        const otpMatch = await bcrypt.compare(OTP, foundUser.OTP);

        //otp is not matched
        if (!otpMatch) return res.sendStatus(401);

        //when otp is match
        //create access token from refresh token
        const accessToken = createAccessToken(
          foundUser,
          role,
          process.env.OTP_ACCESS_TOKEN_EXPIRATION_TIME
        );

        if (!accessToken)
          return res.status(400).send("Access Token creation fail");

        res.status(200).json({ accessToken });
      } catch (err) {
        console.error(`"error-message":${err.message}`);
        return res.sendStatus(400);
      }
    }
  );
};

module.exports = { matchOTP };
