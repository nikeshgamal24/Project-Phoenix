const userDB = {
  users: require("../models/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const fsPromises = require("fs").promises;
const path = require("path");

const handleLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    res.status(400).json({
      message: "Username and password are required to login!",
    });

  // check for user found or not
  const foundUser = userDB.users.find((user) => user.username === username);

  if (!foundUser)
    return res.status(401).json({
      message: "Unauthorized User", //401 ---> Unauthorized user
    });

  //check for the password match
  const match = await bcrypt.compare(password, foundUser.password);

  if (match) {
    const roles = Object.values(foundUser.roles);

    //create JWTs for authorization
    //creating access token
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

    //creating refresh token
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // sving refreshToken with currrent user
    const otherUsers = userDB.users.filter(
      (user) => user.username !== foundUser.username
    );
    const currentUser = { ...foundUser, refreshToken };
    userDB.setUsers([...otherUsers, currentUser]);

    await fsPromises.writeFile(
      path.join(__dirname, "..", "models", "users.json"),
      JSON.stringify(userDB.users)
    );

    // saving refreshToken to the cookie
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    //sending accessToken as an response
    res.status(200).json({
      accessToken,
    });
  } else {
    return res.status(401).json({
      message: "Unauthorized User", //401 ---> Unauthorized user
    });
  }
};

module.exports = { handleLogin };
