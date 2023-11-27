import { Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express, Application } from 'express'; // Import Express and Application types

const options = {
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

const swaggerSpec = swaggerJsdoc(options);

// Extend the Application type to include the use method for swaggerUi
interface ExtendedApplication extends Application {
  use: any; // Use 'any' type here if no specific type information is available
}

function swaggerDocs(app: ExtendedApplication, port: number) {
  // Swagger Page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Documentation in JSON format
  app.get('/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export default swaggerDocs;
