const  allowedOrigins = require("../config/allowedOrigins");

const credentials = (req, res, next) => {
  try {
    const origin = req.headers.origin;
    console.log(req.headers);
    console.log(allowedOrigins, origin);
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Credentials", true);
    }
    next();
  } catch (err) {
    console.error(`error-message:${err.message}`);
    return res.redirect(API_BASE_URL);
  }
};
module.exports = credentials;
