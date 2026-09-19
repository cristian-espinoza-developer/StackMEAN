import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ApiResponse } from '../http/ApiResponse.js';
import { AppError } from '../http/errors.js';

/** Rutas que ningún router atendió. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(404)
    .json(ApiResponse.failure('ROUTE_NOT_FOUND', `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

const isInvalidJson = (error: unknown): boolean =>
  error instanceof SyntaxError && (error as { type?: string }).type === 'entity.parse.failed';


export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    res.status(error.status).json(ApiResponse.failure(error.code, error.message, error.details));
    return;
  }

  if (isInvalidJson(error)) {
    res.status(400).json(ApiResponse.failure('INVALID_JSON', 'El cuerpo de la petición no es un JSON válido'));
    return;
  }

  console.error('❌ [Error no controlado]:', error);
  res.status(500).json(ApiResponse.failure('INTERNAL_ERROR', 'Error interno del servidor'));
};
