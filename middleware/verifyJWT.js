const jwt = require("jsonwebtoken");
require("dotenv").config();
const roleList = require("../config/roleList");
const Student = require("../models/Students");
const Teacher = require("../models/Teachers");
const Admin = require("../models/Admins");

const verifyJWT = (req, res, next) => {
  // const authHeader = req.headers["authorization"];
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //Unauthorized

  const token = authHeader.split(" ")[1];

  //verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403); //403--> invalid token

    let freshUser;
    if (decoded.UserInfo.role.includes(roleList.Student)) {
      freshUser = await Student.findOne({
        email: decoded.UserInfo.email,
      }).exec();
    } else if (decoded.UserInfo.role.includes(roleList.Supervisor)) {
      freshUser = await Teacher.findOne({
        email: decoded.UserInfo.email,
      }).exec();
    } else if (decoded.UserInfo.role.includes(roleList.Admin)) {
      freshUser = await Admin.findOne({ email: decoded.UserInfo.email }).exec();
    } else {
      return res.sendStatus(400);
    }

    req.email = decoded.UserInfo.email;
    req.role = decoded.UserInfo.role;
    req.userId = freshUser._id;
    next();
  });
};

module.exports = verifyJWT;
