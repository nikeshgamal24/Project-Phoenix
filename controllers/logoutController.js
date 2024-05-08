const userDB = {
  users: require("../models/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");

const handleLogout = async (req, res) => {
  //On client, also delete the access token

  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(204); //No Content

  const refreshToken = cookies.jwt;
  // check for user found or not
  const foundUser = userDB.users.find(
    (user) => user.refreshToken === refreshToken
  );

  if (!foundUser) {
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    return res.sendStatus(403);
  }

  //Delete  refreshToken from db
  const otherUsers = userDB.users.filter(
    (user) => user.refreshToken !== refreshToken
  );
  const currentUser = { ...foundUser, refreshToken: "" };
  userDB.setUsers([...otherUsers, currentUser]);

  await fsPromises.writeFile(
    path.join(__dirname,'..','models','users.json'),
    JSON.stringify(userDB.users)
  );

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  res.sendStatus(204);
};

module.exports = { handleLogout };
