import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi.js';

/** Expone la UI en `/api-docs` y la especificación cruda en `/api-docs.json`. */
export const setupSwagger = (app: Express): void => {
  app.get('/api-docs.json', (_req, res) => {
    res.json(openApiDocument);
  });
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, { customSiteTitle: 'API Empleados - Swagger' })
  );
};
