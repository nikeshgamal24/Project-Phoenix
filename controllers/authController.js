const Student = require("../models/Students");
const Supervisor = require("../models/Supervisors");
const Admin = require("../models/Admins");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const roleList = require("../config/roleList");
const { createAccessToken } = require("./createSetTokens/createAccessToken");
const { createRefreshToken } = require("./createSetTokens/createRefreshToken");
const { setCookie } = require("./createSetTokens/setCookie");

const handleLogin = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password)
    return res.status(400).json({
      message: "Username and password are required to login!",
    });

  // check for user found or not
  let foundUser;
  if (role === roleList.Student) {
    foundUser = await Student.findOne({
      email: email,
      role: { $in: [role] },
    }).exec();
  } else if (role === roleList.Supervisor || role === roleList.Defense) {
    foundUser = await Supervisor.findOne({
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

  if (!foundUser)
    return res.status(401).json({
      message: "Unauthorized User", //401 ---> Unauthorized user
    });

  //check for the password match
  const match = await bcrypt.compare(password, foundUser.password);

  if (match) {
    const role = Object.values(foundUser.role);

    //create JWTs for authorization
    //creating access token
    const accessToken = createAccessToken(foundUser,role,process.env.ACCESS_TOKEN_EXPIRATION_TIME);
    if (!accessToken) return res.status(400).send("Access Token creation fail");


    //creating refresh token
    const refreshToken = createRefreshToken(foundUser,process.env.REFRESH_TOKEN_EXPIRATION_TIME );
    if (!refreshToken) return res.status(400).send("Refresh Token creation fail");


    // sving refreshToken with currrent user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    // saving refreshToken to the cookie
    setCookie(res,refreshToken);

    foundUser.password = undefined;
    foundUser.refreshToken = undefined;
    //sending accessToken as an response
    res.status(200).json({
      accessToken,
      user: foundUser,
    });
  } else {
    return res.status(401).json({
      message: "Unauthorized User", //401 ---> Unauthorized user
    });
  }
};

module.exports = { handleLogin };
