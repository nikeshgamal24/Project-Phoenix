const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { version } = require("../package.json");

const options = {
  definition: {
    openai: "3.0.0",
    info: {
      title: "Project Phoenix Rest API Docs",
      version,
    },
    components: {
      securitySchema: {
        bearerAuth: {
          type: "http",
          schema: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./routes/api/*.js","./models/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);
function swaggerDocs(app, port) {
  //swagger page
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  //Docs in JSON format
  app.use("/docs.json", (req, res) => {
    res.header("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Docs available at http://localhost:${port}/docs`);
}
module.exports = {swaggerDocs};
