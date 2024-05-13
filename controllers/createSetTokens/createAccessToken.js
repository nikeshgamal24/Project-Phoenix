const createAccessToken = (foundUser,role,expirationTime) => {
  const accessToken = jwt.sign(
    {
      UserInfo: {
        email: foundUser.email,
        role: role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: expirationTime }
  );
  return accessToken;w
};

module.exports = { createAccessToken };
