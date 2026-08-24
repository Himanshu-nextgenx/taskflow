import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
 definition: {
  openapi: "3.0.0",

  info: {
    title: "TaskFlow API",
    version: "1.0.0",
    description:
      "Project management REST API built with Node.js, Express and TypeScript.",
  },

  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Organization", description: "Organization endpoints" },
    { name: "Projects", description: "Project management endpoints" },
    { name: "Tasks", description: "Task management endpoints" },
    { name: "Comments", description: "Task comment endpoints" },
    { name: "Jobs", description: "Background job endpoints" },
  ],

  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local development server",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "Resource not found",
          },
          code: {
            type: "string",
            example: "NOT_FOUND",
          },
          details: {
            type: "object",
            nullable: true,
            example: null,
          },
        },
      },
    },
  },
},
  // Scan all route files for @swagger JSDoc comments
  apis: [
    "./src/modules/*/routes/*.route.ts",
    "./src/jobs/routes/*.route.ts",
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
