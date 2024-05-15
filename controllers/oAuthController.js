const Admin = require("../models/Admins");
const Student = require("../models/Students");
const Teacher = require("../models/Teachers");
const roleList = require("../config/roleList");
require("dotenv").config();
const { getGoogleOAuthTokens } = require("./getGoogleOAuthTokens");
const { getGoogleUser } = require("./getGoogleUser");
const { createAccessToken } = require("./createSetTokens/createAccessToken");
const { createRefreshToken } = require("./createSetTokens/createRefreshToken");
const { setCookie } = require("./createSetTokens/setCookie");
const {
  extractRollAndBatch,
} = require("./utility functions/extractRollAndBatch");
const {
  updateRollAndBatch,
} = require("./utility functions/updateRollAndBatch");

const updateUserDetails = async (userModel, googleUser, role, refreshToken) => {
  const updatedUser = await userModel.findOneAndUpdate(
    {
      email: googleUser.email,
    },
    {
      email: googleUser.email,
      fullname: googleUser.name,
      photo: googleUser.picture,
      role: role,
      refreshToken: refreshToken,
    },
    {
      upsert: true,
      new: true,
    }
  );
  console.log("inside udpatUserDetails");
  console.log(updatedUser);
  return updatedUser;
};

const googleOauthHandler = async (req, res) => {
  try {
    // get the code from qs
    const code = req.query.code;
    const role = Number(req.query.state);
    console.log(typeof role);

    // get id and access token with code
    const { id_token, access_token } = await getGoogleOAuthTokens(
      req,
      res,
      code
    );

    const googleUser = await getGoogleUser({ id_token, access_token });
    // jwt.decode(id_token);

    if (!googleUser.verified_email) {
      res.sendStatus(403).send("Google account is not verified");
    }

    let validUser;
    let validUserModel;
    // let necessaryModel;
    if (role === roleList.Admin) {
      //validate admin email-->boolean state
      //just check whether the googleUser present in db inside admin collection or not
      validUser = await Admin.findOne({
        email: googleUser.email,
        role: { $in: [role] },
      }).exec();
      validUserModel = Admin;
    } else if (role === roleList.Student) {
      //validate student email-->boolean state
      // Define the regex pattern
      const studentEmailRegex = /^[a-zA-Z]+\.[0-9]{6}@ncit\.edu\.np$/;

      validUser = studentEmailRegex.test(googleUser.email);
      validUserModel = Student;
      const { rollNumber, batchNumber } = extractRollAndBatch(googleUser.email);
      console.log(rollNumber, batchNumber );
      updateRollAndBatch(res,googleUser.email, rollNumber, batchNumber);
    } else if (role === roleList.Supervisor) {
      //validate super email-->boolean state
      const supervisorEmailRegex =
        /^[a-zA-Z]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.edu\.np$/;
      const studentEmailRegex = /^[a-zA-Z]+\.[0-9]{6}@ncit\.edu\.np$/;

      const isStudentEmail = studentEmailRegex.test(googleUser.email);
      validUser =
        supervisorEmailRegex.test(googleUser.email) && !isStudentEmail;
      validUserModel = Teacher;
    } else {
      return res.sendStatus(401);
    }

    if (!validUser) {
      console.error("error-message:User doesn't exist");
      return res.redirect("http://localhost:5173");
    }

    console.log("entering into access token creation");
    //creating access token
    const accessToken = createAccessToken(
      googleUser,
      role,
      process.env.ACCESS_TOKEN_EXPIRATION_TIME
    );

    console.log(accessToken);
    if (!accessToken) return res.status(400).send("Access Token creation fail");
    //creating refresh token
    const refreshToken = createRefreshToken(
      googleUser,
      process.env.REFRESH_TOKEN_EXPIRATION_TIME
    );
    console.log(refreshToken);
    if (!refreshToken)
      return res.status(400).send("Refresh Token creation fail");
    // upsert the user based on the role and model
    //function passing the role required model and refreshToken to save to the db
    const user = await updateUserDetails(
      validUserModel,
      googleUser,
      role,
      refreshToken
    );
    console.log(user);
    // set cookie
    // saving refreshToken to the cookie
    setCookie(res, refreshToken);

    // redirect back to client
    res.redirect(`http://localhost:5173/${role}`);
  } catch (err) {
    console.error(err.message);
    return res.redirect("http://localhost:5173");
  }
};

module.exports = { googleOauthHandler };
