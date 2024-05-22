const jwt = require("jsonwebtoken");
const getUserInfoFromAccessToken = (req) => {
  try {
    //get the user from the access token
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401); //Unauthorized

    const accessToken = authHeader.split(" ")[1];
    const { UserInfo } = jwt.decode(accessToken);
    return UserInfo;
  } catch (err) {
    console.error(`error-messsage:${err.message}`);
  }
};

module.exports = { getUserInfoFromAccessToken };
