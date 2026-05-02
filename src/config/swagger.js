const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { API_VERSION } = require('../constants');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tuk-Tuk Tracking API',
      version: '1.0.0',
      description: 'RESTful API for Real-Time Three-Wheeler (Tuk-Tuk) Tracking & Movement Logging System',
      contact: {
        name: 'COBSCCOMP242P-055',
      },
    },
    servers: [
      {
        url: `http://localhost:3000/api/${API_VERSION}`,
        description: 'Development server',
      },
      {
        url: `/api/${API_VERSION}`,
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: []
    }],
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app, apiPrefix) => {
  app.use(`${apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = {
  setupSwagger,
};
