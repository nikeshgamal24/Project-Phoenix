const axios = require("axios");
const qs = require("qs");
require("dotenv").config();
const getGoogleOAuthTokens = async (req, res, code) => {
  const url = "https://oauth2.googleapis.com/token";
  console.log(code);
  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SCERET,
    redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
    grant_type: "authorization_code",
  };

  console.log(values);

  try {
    const response = await axios.post(url, qs.stringify(values), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log("response.data");
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = { getGoogleOAuthTokens };
