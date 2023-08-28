const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    info: {
      title: "File Sharing API Documentation",
      version: "1.0.0",
      description: "API documentation for file-sharing Node.js application",
    },
    basePath: "/",
  },
  apis: ["./routes/fileRoutes.js", "./routes/userRoutes.js"],
};

module.exports = swaggerJsdoc(options);
