const userDB = {
  users: require("../models/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

//for instance writing to users.json file so we need fs
const fsPromises = require("fs").promises;
const path = require("path");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { username, password } = req.body;
  //status 400 --> Bad Request
  if (!username || !password)
    res.status(400).json({
      message: "User and Password is required",
    });

  //checking for duplicate username || email
  const duplicate = userDB.users.find((user) => user.username === username);

  // status 409--> for conflict status
  if (duplicate)
    return res.status(409).json({
      message: "Duplicate username",
    }); //conflicting status

  try {
    //encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //save to the database
    const newUser = { 
      "username": username, 
      "roles":{
        "User":2001
      },
      "password": hashedPassword 
    };
    userDB.setUsers([...userDB.users, newUser]);

    //save to the database //for now json file
    await fsPromises.writeFile(
      path.join(__dirname, "..", "models", "users.json"),
      JSON.stringify(userDB.users)
    );

    res.status(200).json({
      message: `New user ${username} has been created!`,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = { handleNewUser };
