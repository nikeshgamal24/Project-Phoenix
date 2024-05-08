const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const { logger } = require("./middleware/logEvents");
const PORT = process.env.PORT || 3500;

//custom middle-ware logger
app.use(logger);
//code becomes more cleaner

//Cross Origin Resource Sharing
app.use(cors(corsOptions));

//for built-in middle-ware for urlencoded data
// data from the form data
// content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

//built-in middleware for json data
app.use(express.json());

//server static files
app.use(express.static(path.join(__dirname, "/public")));

//routes middleware
app.use("/", require("./routes/root"));
app.use("/register", require("./routes/register"));
app.use("/auth", require("./routes/auth"));

app.use(verifyJWT);
app.use("/employee", require("./routes/api/employees"));

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
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
