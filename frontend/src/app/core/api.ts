import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const API_URL = environment.apiUrl;

export interface ErrorDetail {
  path: string;
  message: string;
}

/** Envoltorio universal del backend. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  error: { code: string; details?: ErrorDetail[] };
}

export interface ApiError {
  message: string;
  details: ErrorDetail[];
}

/** Convierte cualquier error HTTP en un mensaje legible con sus detalles de validación. */
export const toApiError = (error: unknown): ApiError => {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiFailure> | null;
    if (body && typeof body === 'object' && typeof body.message === 'string') {
      return { message: body.message, details: body.error?.details ?? [] };
    }
    if (error.status === 0) {
      return { message: `No se pudo conectar con el servidor (${API_URL}). ¿Está en ejecución?`, details: [] };
    }
  }
  return { message: 'Ocurrió un error inesperado', details: [] };
};
