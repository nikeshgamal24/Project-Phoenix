const axios = require('axios');
const getGoogleUser = async ({ id_token, access_token }) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = { getGoogleUser };
