const setCookie = (res, refreshToken) => {
  // saving refreshToken to the cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "Strict",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
    domain: "project-phoenix-omega.vercel.app",
  });
};

module.exports = { setCookie };
