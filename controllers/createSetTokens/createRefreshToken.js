const createRefreshToken = (foundUser, expirationTime) => {
  const refreshToken = jwt.sign(
    { email: foundUser.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: expirationTime }
  );
  return refreshToken;
};

module.exports = { createRefreshToken };
