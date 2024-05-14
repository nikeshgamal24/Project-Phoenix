const jwt = require("jsonwebtoken");
const createAccessToken = (foundUser, role, expirationTime) => {
  try {
    //creating access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: foundUser.email,
          role: role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: expirationTime}
    );
    return accessToken;
  } catch (err) {
    console.error(`error-message-access-token-creation:${err.message}`);
    return null;
  }
};

module.exports = { createAccessToken };
