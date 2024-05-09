const Student = require("../models/Students");
const Admin = require("../models/Admins");
const Teacher = require("../models/Teachers");

const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401); //Unauthorized

  const refreshToken = cookies.jwt;
  // check for user found or not
  const foundUser =
    (await Admin.findOne({ refreshToken }).exec()) ??
    (await Student.findOne({ refreshToken }).exec()) ??
    (await Teacher.findOne({ refreshToken }).exec());

  if (!foundUser) return res.sendStatus(403);
  // console.log(foundUser);

  //evaluate jwt for creating access token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    console.log("decoded");
    console.log(decoded);
    if (err || foundUser.email !== decoded.email) return res.sendStatus(403);

    const roles = Object.values(foundUser.role);
    //create access token from refresh token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          email: foundUser.email,
          role: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );
    foundUser.password = undefined;
    foundUser.refreshToken = undefined;
    res.json({ accessToken, user: foundUser });
  });
};

module.exports = { handleRefreshToken };
