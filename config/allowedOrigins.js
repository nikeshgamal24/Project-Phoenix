//creating whiteList in order to ensure your server is accessed by limited domain
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3500",
  "https://ncitprojectphoenix.netlify.app",
];

module.exports = allowedOrigins;
