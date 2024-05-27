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
    if (!accessToken) return res.status(400).send("Access Token creation fail");

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

// const handleEvaluatorLogin = async (req, res) => {
//   try {
//     const { accessCode, role } = req.body;
//     if (!accessCode || !role)
//       return res.status(400).json({
//         message: "Rrequired credentials are missing",
//       });
//     // Query the database to retrieve the evaluator's data based on the role
//     const evaluators = await Evaluator.find({ role });

//     if (!evaluators) {
//       return res.status(404).json({ message: "Evaluator not found" });
//     }
//     //search for the evaluator with the access code after hashing
//     let accessCodeMatched = false;
//     let accessToken;
//     let foundUser;

//     accessCodeMatched = evaluators.forEach(async (evaluator) => {
//       console.log("before accessCodestatus");
//       console.log(accessCode,evaluator.accessCode);
//       const accessCodeStatus = await bcrypt.compare(accessCode, evaluator.accessCode);
//       // const accessCodeStatus = await bcrypt.compare(
//       //   accessCode,
//       //   evaluator.accessCode
//       // );
//       console.log(accessCodeStatus);
//       if (accessCodeStatus) {
//         //create JWTs for authorization
//         //creating access token
//         accessToken = createAccessToken(
//           evaluator,
//           role,
//           process.env.ACCESS_TOKEN_EXPIRATION_TIME
//         );
//         foundUser = evaluator;
//         return true;
//       }
//     });

//     //if accessCode is not matched
//     if (!accessCodeMatched) return res.sendStatus(401);

//     //if something went wrong while creating access token
//     if (!accessToken) return res.status(400).send("Access Token creation fail");

//     //sending accessToken as an response
//     return res.status(200).json({
//       accessToken,
//       user: foundUser,
//     });
//   } catch (err) {
//     console.error(`error-message:${err.message}`);
//     return res.sendStatus(400);
//   }
// };
module.exports = { handleLogin };
