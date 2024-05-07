//creating whiteList in order to ensure your server is accessed by limited domain
const whiteList = [
    "https://www.google.com",
    "http://127.0.0.1:5500",
    "http://localhost:3500",
  ];
  
  const corsOptions = {
    origin: (origin, callback) => {
      console.log(`origin:${origin}`);
      if (whiteList.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not Allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  };

  module.exports = corsOptions;