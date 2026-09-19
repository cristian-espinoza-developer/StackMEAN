import type { Request, Response } from 'express';
import type { CreateEmployeeDto, EmployeeIdParams, UpdateEmployeeDto } from '../dto/employee.dto.js';
import { sendCreated, sendOk } from '../http/ApiResponse.js';
import { NotFoundError } from '../http/errors.js';
import type { IEmployeeRepository } from '../repositories/IEmployeeRepository.js';

const EMPLEADO_NO_ENCONTRADO = 'Empleado no encontrado';

/**
 * Los datos de entrada ya llegan validados por el middleware `validate`, y los
 * errores se propagan (Express 5 captura los rechazos async) al errorHandler.
 */
export class EmpleadoController {
  constructor(private readonly repository: IEmployeeRepository) {}

  getEmpleado = async (_req: Request, res: Response) => {
    sendOk(res, await this.repository.findAll(), 'Empleados obtenidos');
  };

  addEmpleado = async (req: Request<object, unknown, CreateEmployeeDto>, res: Response) => {
    const empleado = await this.repository.create(req.body);
    sendCreated(res, empleado, 'Empleado guardado');
  };

  updateEmpleado = async (req: Request<EmployeeIdParams, unknown, UpdateEmployeeDto>, res: Response) => {
    const empleado = await this.repository.update(req.params.id, req.body);
    if (!empleado) throw new NotFoundError(EMPLEADO_NO_ENCONTRADO);
    sendOk(res, empleado, 'Empleado actualizado');
  };

  deleteEmpleado = async (req: Request<EmployeeIdParams>, res: Response) => {
    const eliminado = await this.repository.delete(req.params.id);
    if (!eliminado) throw new NotFoundError(EMPLEADO_NO_ENCONTRADO);
    sendOk(res, { id: req.params.id }, 'Empleado eliminado');
  };
}
