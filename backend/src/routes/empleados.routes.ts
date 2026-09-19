import express from 'express';
import type { EmpleadoController } from '../controllers/empleados.controllers.js';
import {
  createEmployeeSchema,
  employeeIdParamsSchema,
  updateEmployeeSchema
} from '../dto/employee.dto.js';
import { validate } from '../middlewares/validate.js';

export const createEmpleadosRouter = (empleado: EmpleadoController) => {
  const router = express.Router();

  router.get('/empleados', empleado.getEmpleado);
  router.post('/empleados', validate({ body: createEmployeeSchema }), empleado.addEmpleado);
  router.put(
    '/empleados/:id',
    validate({ params: employeeIdParamsSchema, body: updateEmployeeSchema }),
    empleado.updateEmpleado
  );
  router.delete('/empleados/:id', validate({ params: employeeIdParamsSchema }), empleado.deleteEmpleado);

  return router;
};
