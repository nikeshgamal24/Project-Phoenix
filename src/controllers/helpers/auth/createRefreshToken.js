const jwt = require("jsonwebtoken");
const createRefreshToken = (foundUser,expirationTime) => {
    try {
         //creating refresh token
  const refreshToken = jwt.sign(
    { email: foundUser.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: expirationTime}
  );
  return refreshToken;
      } catch (err) {
        console.error(`error-message:${err.message}`);
        return null;
      }
   
};

module.exports = { createRefreshToken };
