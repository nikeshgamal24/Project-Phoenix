const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { version } = require("../../package.json");
// CDN CSS

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Phoenix Rest API Docs",
      version,
    },
    servers: [
      {
        url: "http://localhost:3500/",
        description: "Localhost",
      },
      {
        url: "https://project-phoenix-clz.vercel.app/",
        description: "Vercel Hosted Backend",
      },
    ],
    components: {
      securitySchemas: {
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
  apis: ["./routes/*.js", "./routes/api/*.js", "./models/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

//function to expose the endpoint
function swaggerDocs(app, port) {
  //swagger page
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec,{ customCssUrl: CSS_URL }));

  //Docs in JSON format
  app.use("/docs.json", (req, res) => {
    res.header("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(`Docs available at http://localhost:${port}/docs`);
}
module.exports = { swaggerDocs };
