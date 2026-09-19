import type { Response } from 'express';
import type { ErrorDetail } from './errors.js';

/** Envoltorio universal: toda respuesta del API tiene `success` y `message`. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  error: {
    code: string;
    details?: ErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export const ApiResponse = {
  success: <T>(data: T, message: string): ApiSuccess<T> => ({ success: true, message, data }),

  failure: (code: string, message: string, details?: ErrorDetail[]): ApiFailure => ({
    success: false,
    message,
    error: details ? { code, details } : { code }
  })
};

export const sendOk = <T>(res: Response, data: T, message = 'Operación exitosa'): void => {
  res.status(200).json(ApiResponse.success(data, message));
};

export const sendCreated = <T>(res: Response, data: T, message = 'Recurso creado'): void => {
  res.status(201).json(ApiResponse.success(data, message));
};
