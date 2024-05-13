const Admin = require("../models/Admins");
const Student = require("../models/Students");
const Teacher = require("../models/Teachers");
const roleList = require("../config/roleList");
const jwt = require("jsonwebtoken");
const { getGoogleOAuthTokens } = require("./getGoogleOAuthTokens");
const { getGoogleUser } = require("./getGoogleUser");
const {
  validateSupervisorEmail,
} = require("./verifyEmails/validateSupervisorEmail");
const { validateStudentEmail } = require("./verifyEmails/validateStudentEmail");
const { searchUser } = require("./verifyEmails/searchUser");
const { createRefreshToken } = require("./createSetTokens/createRefreshToken");
const { setCookie } = require("./createSetTokens/setCookie");

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
  return updatedUser;
};

const googleOauthHandler = async (req, res) => {
  try {
    // get the code from qs
    const code = req.query.code;
    const role = Number(req.query.state);

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

    switch (role) {
      case roleList.Admin:
        validUser = await searchUser(Admin, googleUser.email, role);
        validUserModel = Admin;
        break;
      case roleList.Student:
        //validate student email-->boolean state
        validUser = validateStudentEmail(googleUser.email);
        validUserModel = Student;
        break;
      case roleList.Supervisor:
        validUser = validateSupervisorEmail(googleUser.email);
        validUserModel = Teacher;
        break;
      default:
        return res.sendStatus(401);
    }

    if (!validUser) {
      console.error("error-message:User doesn't exist");
      return res.redirect("http://localhost:5173");
    }

    //creating access token
    const accessToken = createAccessToken(
      googleUser,
      role,
      process.env.ACCESS_TOKEN_EXPIRATION_TIME
    );

    //creating refresh token
    //creating refresh token
    const refreshToken = createRefreshToken(
      foundUser,
      process.env.REFRESH_TOKEN_EXPIRATION_TIME
    );

    // upsert the user based on the role and model
    //function passing the role required model and refreshToken to save to the db
    const user = await updateUserDetails(
      validUserModel,
      googleUser,
      role,
      refreshToken
    );

    // set cookie
    // saving refreshToken to the cookie
    setCookie(refreshToken);

    // redirect back to client
    res.redirect(`http://localhost:5173/${role}`);
  } catch (err) {
    console.error(err.message);
    return res.redirect("http://localhost:5173");
  }
};

module.exports = { googleOauthHandler };
