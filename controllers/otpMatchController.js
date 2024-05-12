const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const roleList = require("../config/roleList");
const Student = require("../models/Students");
const Admin = require("../models/Admins");
const Teacher = require("../models/Teachers");

const matchOTP = async (req, res) => {
  const {OTP } = req.body;
  // const authHeader = req.headers["authorization"];
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //Unauthorized
  const accessToken = authHeader.split(" ")[1];

  // const accessToken =token;
  if (!accessToken || !OTP)
    return res.sendStatus(401).send("Unauthorized User");

  //verify and decode access token and chech for the user
  //evaluate jwt for creating access token
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,
    async (err, decoded) => {
      console.log("decoded");
      console.log(decoded);

      if (err || !decoded.UserInfo.email || !OTP)
        return res.sendStatus(403).send("Forbidden");

      const currentUserEmail = decoded.UserInfo.email;
      const role = decoded.UserInfo.role;
      console.log(currentUserEmail, role);

      try {
        // check for user found or not
        let foundUser;
        if (role.includes(roleList.Student)) {
          foundUser = await Student.findOne({
            email: currentUserEmail,
            role: { $in: [role] },
          }).exec();
        } else if (role.includes(roleList.Supervisor)) {
          foundUser = await Teacher.findOne({
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

        if (!foundUser) return res.sendStatus(404).send("User not found");

        const otpMatch = await bcrypt.compare(OTP, foundUser.OTP);

        //otp is not matched
        if (!otpMatch) return res.sendStatus(401).send("Unauthorized User");

        //when otp is match
        //create access token from refresh token
        const accessToken = jwt.sign(
          {
            UserInfo: {
              email: foundUser.email,
              role: role,
            },
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "10m" }
        );

        res.status(200).json({ accessToken });
      } catch (err) {
        console.error(`"error-message":${err.message}`);
        return res.sendStatus(400);
      }
    }
  );

  //match otp
};

module.exports = { matchOTP };
