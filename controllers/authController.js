const Student = require("../models/Student");
const Supervisor = require("../models/Supervisor");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const Evaluator = require("../models/Evaluator");
const jwt = require("jsonwebtoken");
const roleList = require("../config/roleList");
const { createAccessToken } = require("./createSetTokens/createAccessToken");
const { createRefreshToken } = require("./createSetTokens/createRefreshToken");
const { setCookie } = require("./createSetTokens/setCookie");

const handleLogin = async (req, res) => {
  try {
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
    } else if (role === roleList.Supervisor) {
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

    let match;
    try {
      //check for the password match
      match = await bcrypt.compare(password, foundUser.password);
    } catch (err) {
      console.error(`error-message: ${err.message}`);
      return res.status(401).json({
        message: "Unauthorized User", //401 ---> Unauthorized user
      });
    }

    if (match) {
      const role = Object.values(foundUser.role);

      //create JWTs for authorization
      //creating access token
      const accessToken = createAccessToken(
        foundUser,
        role,
        process.env.ACCESS_TOKEN_EXPIRATION_TIME
      );

      if (!accessToken)
        return res.status(400).send("Access Token creation fail");

      //creating refresh token
      const refreshToken = createRefreshToken(
        foundUser,
        process.env.REFRESH_TOKEN_EXPIRATION_TIME
      );

      if (!refreshToken)
        return res.status(400).send("Refresh Token creation fail");

      // sving refreshToken with currrent user
      foundUser.refreshToken = refreshToken;
      const result = await foundUser.save();
      // saving refreshToken to the cookie
      setCookie(res, refreshToken);

      foundUser.password = undefined;
      foundUser.refreshToken = undefined;
      //sending accessToken as an response
      return res.status(200).json({
        accessToken,
        user: foundUser,
      });
    } else {
      return res.status(401).json({
        message: "Unauthorized User", //401 ---> Unauthorized user
      });
    }
  } catch (err) {
    console.log(`error-message`);
    return res.sendStatus(400);
  }
};

const handleEvaluatorLogin = async (req, res) => {
  try {
    const { accessCode, role } = req.body;
    console.log(accessCode, role);
    if (!accessCode || !role)
      return res.status(400).json({
        message: "Rrequired credentials are missing",
      });

    // Query the database to retrieve the evaluator's data based on the role
    const evaluators = await Evaluator.find({ role });

    if (!evaluators) {
      return res.sendStatus(204);
    }

    //search for the evaluator with the access code after hashing
    let accessCodeMatched = false;
    let matchFoundFlag = 0;
    let accessToken, foundUser;

    for (const evaluator of evaluators) {
      for (const defenseObj of evaluator.defense) {
        //if accesscode is there only procceed for compare
        if (defenseObj.accessCode) {
          //check for the access code match
          accessCodeMatched = await bcrypt.compare(
            accessCode,
            defenseObj.accessCode
          );

          const role = Object.values(evaluator.role);

          //if accessCode match
          if (accessCodeMatched) {
            //if match then create accessToken and break
            accessToken = createAccessToken(
              evaluator,
              role,
              process.env.ACCESS_TOKEN_EXPIRATION_TIME
            );

            if (!accessToken)
              return res.status(400).send("Access Token creation fail");
            foundUser = evaluator;
            foundUser.currentDefense = defenseObj.defenseId;
            matchFoundFlag = 1;
            break;
          } //unauthorized
        }
      }
      if (matchFoundFlag) break;
    }

    //not an authorized user
    if (!foundUser) return res.sendStatus(401);

    //creating refresh token
    const refreshToken = createRefreshToken(
      foundUser,
      process.env.REFRESH_TOKEN_EXPIRATION_TIME
    );

    //if something went wrong on creating refresh token
    if (!refreshToken)
      return res.status(400).send("Refresh Token creation fail");

    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    // saving refreshToken to the cookie
    setCookie(res, refreshToken);
    //sending accessToken as an response
    foundUser.refreshToken = undefined;
    for (const evaluator of evaluators) {
      for (const defenseObj of evaluator.defense) {
        defenseObj.accessCode = undefined;
      }
    }
    return res.status(200).json({
      accessToken,
      user: foundUser,
    });
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.sendStatus(400);
  }
};
module.exports = { handleLogin, handleEvaluatorLogin };
