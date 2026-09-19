import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ValidationError, type ErrorDetail } from '../http/errors.js';

interface Schemas {
  body?: ZodType;
  params?: ZodType;
}

/**
 * Valida `req.body` y/o `req.params` contra esquemas Zod. Si todo es válido,
 * reemplaza los valores por los ya parseados (recortados y tipados); si no,
 * responde con un único `ValidationError` que agrupa todos los problemas.
 */
export const validate = (schemas: Schemas): RequestHandler => (req, _res, next) => {
  const details: ErrorDetail[] = [];

  for (const source of ['params', 'body'] as const) {
    const schema = schemas[source];
    if (!schema) continue;

    const result = schema.safeParse(req[source]);
    if (result.success) {
      req[source] = result.data;
      continue;
    }
    for (const issue of result.error.issues) {
      const path = [source, ...issue.path.map(String)].join('.');
      details.push({ path, message: issue.message });
    }
  }

  next(details.length > 0 ? new ValidationError(details) : undefined);
};
