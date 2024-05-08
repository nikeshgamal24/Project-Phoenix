const User = require("../models/User");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  const { username, password } = req.body;
  //status 400 --> Bad Request
  if (!username || !password)
    res.status(400).json({
      message: "User and Password is required",
    });

  //checking for duplicate username || email
  const duplicate = await User.findOne({ username:username }).exec();

  // status 409--> for conflict status
  if (duplicate)
    return res.status(409).json({
      message: "Duplicate username",
    }); //conflicting status

  try {
    //encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //creating and save to the database
    const newUser = await User.create({
      username: username,
      password: hashedPassword,
    });
    console.log(newUser);

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
