//creating whiteList in order to ensure your server is accessed by limited domain
const allowedOrigins = [
    "https://www.google.com",
    "http://127.0.0.1:5500",
    "http://localhost:3500",
  ];
  
module.exports = allowedOrigins;