const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Supervisor = require("../models/Supervisor");
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
  updateRollBatchAndStatus,
} = require("./utility functions/updateRollBatchAndStatus");
const {
  initializeProgressStatus,
} = require("./utility functions/initializeProgressStatus");

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

    let validUser, validUserModel, rollNumber, batchNumber, progressStatus;
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

      //extract roll number and batch number from the email address of the student
      const { rollNo, batchNo } = extractRollAndBatch(googleUser.email);
      rollNumber = rollNo;
      batchNumber = batchNo;
    } else if (role === roleList.Supervisor) {
      //validate super email-->boolean state
      const supervisorEmailRegex =
        /^[a-zA-Z]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.edu\.np$/;
      const studentEmailRegex = /^[a-zA-Z]+\.[0-9]{6}@ncit\.edu\.np$/;

      const isStudentEmail = studentEmailRegex.test(googleUser.email);
      validUser =
        supervisorEmailRegex.test(googleUser.email) && !isStudentEmail;
      validUserModel = Supervisor;
    } else {
      return res.sendStatus(401);
    }

    if (!validUser) {
      console.error("error-message:User doesn't exist");
      return res.redirect(`${process.env.CLIENT_BASE_URL}`);
    }

    console.log("entering into access token creation");
    //creating access token
    const accessToken = createAccessToken(
      googleUser,
      role,
      process.env.ACCESS_TOKEN_EXPIRATION_TIME
    );

    if (!accessToken) return res.status(400).send("Access Token creation fail");
    //creating refresh token
    const refreshToken = createRefreshToken(
      googleUser,
      process.env.REFRESH_TOKEN_EXPIRATION_TIME
    );

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

    //update rollnumber, batch number only if the googleUser is a student of the organization else skip the update function call
    if (validUserModel === Student) {
      //determine the progress status of the student on their project based on the year of their academic and setting the progress status to database
     if(!user.progressStatus) {
       progressStatus = initializeProgressStatus(batchNumber);
     }
      updateRollBatchAndStatus(
        res,
        googleUser.email,
        rollNumber,
        batchNumber,
        progressStatus
      );
    }

    // set cookie
    // saving refreshToken to the cookie
    setCookie(res, refreshToken);

    // redirect back to client
    res.redirect(`${process.env.CLIENT_BASE_URL}/${role}`);
  } catch (err) {
    console.error(err.message);
    return res.redirect(`${process.env.CLIENT_BASE_URL}`);
  }
};

module.exports = { googleOauthHandler };
