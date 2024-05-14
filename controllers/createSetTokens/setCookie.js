const setCookie = (res,refreshToken)=>{
// saving refreshToken to the cookie
res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
}

module.exports = {setCookie};