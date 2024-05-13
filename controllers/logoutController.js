const Student = require("../models/Students");
const Admin = require("../models/Admins");
const Teacher = require("../models/Teachers");

const handleLogout = async (req, res) => {
  //On client, also delete the access token
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204); //No Content

    const refreshToken = cookies.jwt;
    // check for user found or not
    const foundUser =
      (await Admin.findOne({ refreshToken }).exec()) ??
      (await Student.findOne({ refreshToken }).exec()) ??
      (await Teacher.findOne({ refreshToken }).exec());

    if (!foundUser) {
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.sendStatus(403);
    }

    //Delete  refreshToken from db
    foundUser.refreshToken = "";
    const result = await foundUser.save();

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    res.sendStatus(204);
  } catch (err) {
    console.error(`"error-message":${err.nessage}`);
    return res.sendStatus(400);
  }
};

module.exports = { handleLogout };
