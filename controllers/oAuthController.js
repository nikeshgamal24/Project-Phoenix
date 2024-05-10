const Admin = require("../models/Admins");
const roleList = require("../config/roleList");
const jwt = require("jsonwebtoken");
const { getGoogleOAuthTokens } = require("./getGoogleOAuthTokens");
const { getGoogleUser } = require("./getGoogleUser");

const googleOauthHandler = async (req, res) => {
  try {
    // get the code from qs
    const code = req.query.code;

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

    //creating access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: googleUser.email,
          role: roleList.Admin,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    //creating refresh token
    const refreshToken = jwt.sign(
      { email: googleUser.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // upsert the user
    const user = await Admin.findOneAndUpdate(
      {
        email: googleUser.email,
      },
      {
        email: googleUser.email,
        fullname: googleUser.name,
        photo: googleUser.picture,
        role: roleList.Admin,
        refreshToken: refreshToken,
      },
      {
        upsert: true,
        new: true,
      }
    );
    
    // set cookie
    // saving refreshToken to the cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    // redirect back to client
    res.redirect("http://localhost:5173/5150");
  } catch (err) {
    console.error(err.message);
    return res.redirect("http://localhost:5173");
  }
};

module.exports = { googleOauthHandler };
