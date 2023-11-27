const swaggerDocumentation = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Agriculture traceability',
      description: 'Agriculture traceability API description',
      version: '1.0.0',
    },
  },
  server: [
    { url: 'http://localhost:5000', description: 'Local dev' },
    {
      url: 'https://agriculture-traceability.vercel.app/',
      description: 'Production dev',
    },
  ],
  apis: ['./src/routers/*.ts'],
};

export default swaggerDocumentation;
