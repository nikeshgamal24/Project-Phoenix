const jwt = require("jsonwebtoken");
require("dotenv").config();
const roleList = require("../config/roleList");
const Student = require("../models/Student");
const Supervisor = require("../models/Supervisor");
const Admin = require("../models/Admin");
const Evaluator = require("../models/Evaluator"); // Corrected import

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); // Unauthorized

  const token = authHeader.split(" ")[1];

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) return res.sendStatus(403); // 403 --> Invalid token

    let freshUser;
    const email = decoded.UserInfo.email;
    const role = decoded.UserInfo.role;

    try {
      if (role.includes(roleList.Student)) {
        freshUser = await Student.findOne({ email }).exec();
      } else if (role.includes(roleList.Supervisor)) {
        freshUser = await Supervisor.findOne({ email }).exec();
      } else if (role.includes(roleList.Admin)) {
        freshUser = await Admin.findOne({ email }).exec();
      } else if (role.includes(roleList.Evaluator)) {
        freshUser = await Evaluator.findOne({ email }).exec();
      } else {
        return res.sendStatus(400); // Bad request if role doesn't match
      }

      if (!freshUser) return res.sendStatus(404); // Not found if no user is found

      req.email = email;
      req.role = role;
      req.userId = freshUser._id;
      next();
    } catch (error) {
      console.error(error);
      return res.sendStatus(500); // Internal server error
    }
  });
};

module.exports = verifyJWT;
