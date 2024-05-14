//export client base url
// const API_BASE_URL = "http://localhost:5173";

//  const API_BASE_URL = "http://localhost:5174";

//creating whiteList in order to ensure your server is accessed by limited domain
const allowedOrigins = [
  "https://www.google.com",
  "http://127.0.0.1:5500",
  "http://localhost:3500",
  "http://localhost:5174",
  "http://localhost:5173",
];

module.exports = allowedOrigins ;
