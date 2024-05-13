const Student = require("../models/Students");
const Teacher = require("../models/Teachers");
const Admin = require("../models/Admins");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const roleList = require("../config/roleList");
const { searchUser } = require("./verifyEmails/searchUser");
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

  if (!foundUser)
    return res.status(401).json({
      message: "Unauthorized User", //401 ---> Unauthorized user
    });

  try {
    //check for the password match
    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
      const role = Object.values(foundUser.role);

      //create JWTs for authorization
      //creating access token
      const accessToken = createAccessToken(
        foundUser,
        role,
        process.env.ACCESS_TOKEN_EXPIRATION_TIME
      );

      //creating refresh token
      const refreshToken = createRefreshToken(
        foundUser,
        process.env.REFRESH_TOKEN_EXPIRATION_TIME
      );

      // sving refreshToken with currrent user
      foundUser.refreshToken = refreshToken;
      const result = await foundUser.save();

      // saving refreshToken to the cookie
      setCookie(refreshToken);

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
  } catch (err) {
    console.log(`"error-message":${err.message}`);
    return res.sendStatus(400);
  }
};

module.exports = { handleLogin };
