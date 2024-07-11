require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const { logger } = require("./middleware/logEvents");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const { swaggerDocs } = require("./utils/swagger");
const PORT = process.env.PORT || 3500;
// require('./processor/index');

//connect mongoDB
connectDB();

//custom middle-ware logger
// app.use(logger);
//code becomes more cleaner

//middleware for access-control-allow credentials
app.use(credentials);

//Cross Origin Resource Sharing
app.use(cors(corsOptions));

//for built-in middle-ware for urlencoded data
// data from the form data
// content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

//built-in middleware for json data
  app.use(express.json());

//middleware for cookie
app.use(cookieParser());

//server static files
app.use(express.static(path.join(__dirname, "/public")));

//routes middleware
app.use("/", require("./routes/root"));

app.use("/api/register", require("./routes/register"));
app.use("/api/oauth/google", require("./routes/oauth"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/refresh", require("./routes/refresh"));
app.use("/api/forgotPassword/email", require("./routes/forgotPassword"));
app.use("/api/logout", require("./routes/logout"));
app.use("/api/forgotPassword/OTP", require("./routes/matchOTP"));
app.use("/api/forgotPassword/password", require("./routes/passwordReset"));

//excute the swagger docs function
swaggerDocs(app, PORT);
app.use(verifyJWT);

app.use("/api/user", require("./routes/getUserInformation"));
app.use("/api/event", require("./routes/api/events"));
app.use("/api/evaluator", require("./routes/api/evaluators"));
app.use("/api/student", require("./routes/api/students"));
app.use("/api/supervisor", require("./routes/api/supervisors"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({
      error: "404 NOT FOUND",
    });
  } else {
    res.type("txt").send("404 NOT FOUND");
  }
});

//middleware for error handling
// app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
