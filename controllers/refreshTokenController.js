const Student = require("../models/Student");
const Admin = require("../models/Admin");
const Supervisor = require("../models/Supervisor");

const jwt = require("jsonwebtoken");
const { createAccessToken } = require("./createSetTokens/createAccessToken");

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401); //Unauthorized

    const refreshToken = cookies.jwt;
    // check for user found or not
    const foundUser =
      (await Admin.findOne({ refreshToken }).exec()) ??
      (await Student.findOne({ refreshToken }).exec()) ??
      (await Supervisor.findOne({ refreshToken }).exec());

    if (!foundUser) return res.sendStatus(403);
    // console.log(foundUser);

    //evaluate jwt for creating access token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
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
