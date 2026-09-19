import { z, type ZodType } from 'zod';
import {
  createEmployeeSchema,
  employeeIdParamsSchema,
  employeeResponseSchema,
  updateEmployeeSchema
} from '../dto/employee.dto.js';

type Json = Record<string, unknown>;

/** Los esquemas Zod del DTO son la única fuente de verdad del contrato. */
const toSchema = (schema: ZodType, extra: Json = {}): Json => {
  const { $schema: _omit, ...json } = z.toJSONSchema(schema, { target: 'openapi-3.0', io: 'input' }) as Json;
  return { ...json, ...extra };
};

const ref = (name: string): Json => ({ $ref: `#/components/schemas/${name}` });

const envelope = (data: Json): Json => ({
  type: 'object',
  required: ['success', 'message', 'data'],
  properties: {
    success: { type: 'boolean', enum: [true] },
    message: { type: 'string', example: 'Operación exitosa' },
    data
  }
});

const jsonContent = (schema: Json, example?: unknown): Json => ({
  'application/json': example === undefined ? { schema } : { schema, example }
});

const errorResponse = (description: string, code: string, message: string, details?: Json[]): Json => ({
  description,
  content: jsonContent(ref('ApiFailure'), {
    success: false,
    message,
    error: details ? { code, details } : { code }
  })
});

const idSchema = (toSchema(employeeIdParamsSchema).properties as Record<string, Json>).id as Json;

const idParameter: Json = {
  name: 'id',
  in: 'path',
  required: true,
  description: idSchema.description,
  schema: idSchema
};

const validation400 = { $ref: '#/components/responses/ValidationError' };
const notFound404 = { $ref: '#/components/responses/NotFound' };
const internal500 = { $ref: '#/components/responses/InternalError' };

export const openApiDocument: Json = {
  openapi: '3.0.3',
  info: {
    title: 'API de Gestión de Empleados',
    version: '1.0.0',
    description:
      'CRUD de empleados. Todas las respuestas usan un envoltorio uniforme: ' +
      '`{ success, message, data }` en éxito y `{ success, message, error: { code, details? } }` en fallo.'
  },
  servers: [{ url: '/api/v1', description: 'Servidor actual' }],
  tags: [{ name: 'Empleados', description: 'Gestión de empleados' }],
  paths: {
    '/empleados': {
      get: {
        tags: ['Empleados'],
        summary: 'Listar empleados',
        operationId: 'listarEmpleados',
        responses: {
          '200': {
            description: 'Lista de empleados',
            content: jsonContent(envelope({ type: 'array', items: ref('Employee') }))
          },
          '500': internal500
        }
      },
      post: {
        tags: ['Empleados'],
        summary: 'Crear un empleado',
        operationId: 'crearEmpleado',
        requestBody: { required: true, content: jsonContent(ref('CreateEmployee')) },
        responses: {
          '201': { description: 'Empleado creado', content: jsonContent(envelope(ref('Employee'))) },
          '400': validation400,
          '500': internal500
        }
      }
    },
    '/empleados/{id}': {
      put: {
        tags: ['Empleados'],
        summary: 'Actualizar un empleado',
        description: 'Actualiza solo los campos enviados; debe enviarse al menos uno.',
        operationId: 'actualizarEmpleado',
        parameters: [idParameter],
        requestBody: { required: true, content: jsonContent(ref('UpdateEmployee')) },
        responses: {
          '200': { description: 'Empleado actualizado', content: jsonContent(envelope(ref('Employee'))) },
          '400': validation400,
          '404': notFound404,
          '500': internal500
        }
      },
      delete: {
        tags: ['Empleados'],
        summary: 'Eliminar un empleado',
        operationId: 'eliminarEmpleado',
        parameters: [idParameter],
        responses: {
          '200': {
            description: 'Empleado eliminado',
            content: jsonContent(
              envelope({
                type: 'object',
                required: ['id'],
                properties: { id: idSchema }
              })
            )
          },
          '400': validation400,
          '404': notFound404,
          '500': internal500
        }
      }
    }
  },
  components: {
    schemas: {
      Employee: toSchema(employeeResponseSchema),
      CreateEmployee: toSchema(createEmployeeSchema),
      UpdateEmployee: toSchema(updateEmployeeSchema, { minProperties: 1 }),
      ApiFailure: {
        type: 'object',
        required: ['success', 'message', 'error'],
        properties: {
          success: { type: 'boolean', enum: [false] },
          message: { type: 'string' },
          error: {
            type: 'object',
            required: ['code'],
            properties: {
              code: {
                type: 'string',
                enum: ['VALIDATION_ERROR', 'INVALID_JSON', 'NOT_FOUND', 'ROUTE_NOT_FOUND', 'INTERNAL_ERROR']
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['path', 'message'],
                  properties: {
                    path: { type: 'string', example: 'body.sueldo' },
                    message: { type: 'string', example: 'sueldo debe ser mayor que 0' }
                  }
                }
              }
            }
          }
        }
      }
    },
    responses: {
      ValidationError: errorResponse(
        'Datos inválidos: body o id no cumplen las reglas (también `INVALID_JSON` si el JSON está mal formado)',
        'VALIDATION_ERROR',
        'Los datos enviados no son válidos',
        [{ path: 'body.sueldo', message: 'sueldo debe ser mayor que 0' }]
      ),
      NotFound: errorResponse('El empleado no existe', 'NOT_FOUND', 'Empleado no encontrado'),
      InternalError: errorResponse('Error interno del servidor', 'INTERNAL_ERROR', 'Error interno del servidor')
    }
  }
};
