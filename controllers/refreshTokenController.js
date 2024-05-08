const User = require('../models/User');

const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401); //Unauthorized

  const refreshToken = cookies.jwt;
  // check for user found or not
  const foundUser = await User.findOne({refreshToken}).exec();

  if (!foundUser) return res.sendStatus(403);

  //evaluate jwt for creating access token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);

      const roles = Object.values(foundUser.roles);
    //create access token from refresh token
    const accessToken = jwt.sign(
      {
        "UserInfo": {
          "username": foundUser.username,
          "roles":roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    res.json({ accessToken });
  });

};

module.exports = { handleRefreshToken };
