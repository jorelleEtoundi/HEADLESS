const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://headless-fjdchfd4hwe2ggd2.francecentral-01.azurewebsites.net",
      },
    ],
  },
  apis: ["./swaggerSpecs.js"], // Chemin vers les fichiers contenant les annotations Swagger
};

const specs = swaggerJsdoc(options);

module.exports = { specs };
