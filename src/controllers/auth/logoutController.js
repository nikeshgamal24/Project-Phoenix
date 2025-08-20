const Student = require("../../models/user/Student");
const Admin = require("../../models/user/Admin");
const Supervisor = require("../../models/user/Supervisor");

const handleLogout = async (req, res) => {
  //On client, also delete the access token

  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); //No Content

  const refreshToken = cookies.jwt;
  console.log("🚀 ~ handleLogout ~ refreshToken:", refreshToken)
  // check for user found or not
  const foundUser =
  (await Admin.findOne({ refreshToken }).exec()) ??
  (await Student.findOne({ refreshToken }).exec()) ??
  (await Supervisor.findOne({ refreshToken }).exec());
  console.log("🚀 ~ handleLogout ~ foundUser:", foundUser)
  
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
  console.log("🚀 ~ handleLogout ~ result:", result)

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.sendStatus(204);
};

module.exports = { handleLogout };
