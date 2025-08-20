const Student = require("../../models/user/Student");
const Admin = require("../../models/user/Admin");
const Supervisor = require("../../models/user/Supervisor");

const jwt = require("jsonwebtoken");
const { createAccessToken } = require("../helpers/auth/createAccessToken");
const Evaluator = require("../../models/user/Evaluator");

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    
    if (!cookies?.jwt) return res.sendStatus(401); //Unauthorized
    // console.log("inside refresh middleware");
    // console.log(refreshToken);
    const refreshToken = cookies.jwt;
    // check for user found or not
    const foundUser =
      (await Admin.findOne({ refreshToken }).exec()) ??
      (await Student.findOne({ refreshToken }).exec()) ??
      (await Supervisor.findOne({ refreshToken }).exec()) ??
      (await Evaluator.findOne({ refreshToken }).exec());

    // console.log("foundUser");
    // console.log(foundUser);
    if (!foundUser) return res.sendStatus(403);
    // console.log(foundUser);

    //evaluate jwt for creating access token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        // console.log("inside jwt verifying section");
        // console.log(decoded.email);
        // console.log(foundUser.email);
        if (err || foundUser.email !== decoded.email)
          return res.sendStatus(403);

        const role = Object.values(foundUser.role);
        //create access token from refresh token
        const accessToken = createAccessToken(
          foundUser,
          role,
          process.env.ACCESS_TOKEN_EXPIRATION_TIME
        );

        foundUser.password = undefined;
        foundUser.refreshToken = undefined;
        res.json({ accessToken, user: foundUser });
      }
    );
  } catch (err) {
    console.log(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};

module.exports = { handleRefreshToken };
