//creating whiteList in order to ensure your server is accessed by limited domain
const allowedOrigins = [
  "http://localhost:5173",
  "https://project-phoenix-omega.vercel.app",
  "capacitor://localhost", // iOS
  "https://localhost", // Android
  "https://projectphoenix.vercel.app"
];

module.exports = allowedOrigins;
