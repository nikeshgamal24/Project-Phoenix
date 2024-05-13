const jwt = require("jsonwebtoken");

const createAccessToken = (foundUser, role, expirationTime) => {
  const accessToken = jwt.sign(
    {
      UserInfo: {
        email: foundUser.email,
        role: role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: expirationTime }
  );
  return accessToken;
};

module.exports = { createAccessToken };
