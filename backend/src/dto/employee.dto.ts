import { z } from 'zod';

const texto = (campo: string) =>
  z
    .string({ error: `${campo} debe ser texto` })
    .trim()
    .min(1, `${campo} es obligatorio`)
    .max(100, `${campo} no puede superar los 100 caracteres`);

// Campos reutilizados por los esquemas; `meta` alimenta la documentación Swagger.
const nombre = texto('nombre').meta({ description: 'Nombre completo del empleado', example: 'Ana Torres' });
const cargo = texto('cargo').meta({ description: 'Cargo que desempeña', example: 'Desarrolladora' });
const departamento = texto('departamento').meta({ description: 'Departamento al que pertenece', example: 'TI' });
const sueldo = z
  .number({ error: 'sueldo debe ser un número' })
  .positive('sueldo debe ser mayor que 0')
  .max(1_000_000_000, 'sueldo excede el máximo permitido')
  .meta({ description: 'Sueldo mensual (mayor que 0)', example: 1500 });

/** POST /empleados: todos los campos son obligatorios y no se aceptan extras. */
export const createEmployeeSchema = z.strictObject({ nombre, cargo, departamento, sueldo });

/** PUT /empleados/:id: campos opcionales, pero al menos uno. */
export const updateEmployeeSchema = z
  .strictObject({
    nombre: nombre.optional(),
    cargo: cargo.optional(),
    departamento: departamento.optional(),
    sueldo: sueldo.optional()
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'Debe enviar al menos un campo para actualizar'
  });

/** Parámetros de ruta `:id` (ObjectId de 24 caracteres hexadecimales). */
export const employeeIdParamsSchema = z.strictObject({
  id: z
    .string()
    .regex(/^[0-9a-f]{24}$/i, 'id debe ser un identificador de 24 caracteres hexadecimales')
    .meta({ description: 'Identificador del empleado', example: '6aaec2eb2124d04e93a2a6ce' })
});

/** Forma pública de un empleado en las respuestas (solo para documentación). */
export const employeeResponseSchema = z.object({
  id: employeeIdParamsSchema.shape.id,
  nombre,
  cargo,
  departamento,
  sueldo,
  createdAt: z.iso.datetime().meta({ description: 'Fecha de creación (ISO 8601)' }),
  updatedAt: z.iso.datetime().meta({ description: 'Fecha de última actualización (ISO 8601)' })
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type EmployeeIdParams = z.infer<typeof employeeIdParamsSchema>;
