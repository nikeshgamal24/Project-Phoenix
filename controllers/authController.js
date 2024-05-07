const userDB = {
  users: require("../models/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const bcrypt = require("bcrypt");

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
  const match = await bcrypt.compare(password,foundUser.password);
  if(match){
    //create JWTs for authorization 

    res.status(200).json({
        "message":`User ${username} is logged in!`
    });
  }else{
    return res.status(401).json({
        message: "Unauthorized User", //401 ---> Unauthorized user
      });
  }
};

module.exports = { handleLogin };
