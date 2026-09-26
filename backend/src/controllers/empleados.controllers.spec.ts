import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Request, Response } from 'express';
import type { Employee } from '../domain/employee.js';
import { NotFoundError } from '../http/errors.js';
import type { IEmployeeRepository } from '../repositories/IEmployeeRepository.js';
import { EmpleadoController } from './empleados.controllers.js';

// Prueba unitaria de caja blanca: el controlador solo depende de la abstracción
// IEmployeeRepository, así que se sustituye por un doble de prueba (sin MongoDB).

const ID = '6ab07953f17a708eb0f2216b';

const fakeEmployee: Employee = {
  id: ID,
  nombre: 'Andrés Mendoza',
  cargo: 'Arquitecto',
  departamento: 'TI',
  sueldo: 4000,
  createdAt: new Date('2026-09-21T00:24:51.050Z'),
  updatedAt: new Date('2026-09-21T00:24:51.050Z')
};

describe('🧪 Unit Test: EmpleadoController (Mantenibilidad & Testabilidad)', () => {
  let controller: EmpleadoController;
  let mockRepository: jest.Mocked<IEmployeeRepository>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock<(code: number) => unknown>;
  let jsonMock: jest.Mock<(body: unknown) => unknown>;

  beforeEach(() => {
    // 1. Mock 100% aislado de la interfaz (cero dependencia de MongoDB/Mongoose)
    mockRepository = {
      findAll: jest.fn<IEmployeeRepository['findAll']>(),
      create: jest.fn<IEmployeeRepository['create']>(),
      update: jest.fn<IEmployeeRepository['update']>(),
      delete: jest.fn<IEmployeeRepository['delete']>()
    };

    controller = new EmpleadoController(mockRepository);

    // 2. Mock de los objetos del ciclo de vida de Express: res.status(...).json(...)
    jsonMock = jest.fn();
    statusMock = jest.fn<(code: number) => unknown>().mockReturnValue({ json: jsonMock });
    mockResponse = { status: statusMock } as unknown as Partial<Response>;
    mockRequest = {};
  });

  describe('getEmpleado', () => {
    it('Debería retornar un estado 200 y la lista de empleados de la abstracción', async () => {
      const fakeEmployees = [fakeEmployee];
      mockRepository.findAll.mockResolvedValue(fakeEmployees);

      await controller.getEmpleado(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: 'Empleados obtenidos',
        data: fakeEmployees
      });
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('addEmpleado', () => {
    it('Debería delegar la creación a la abstracción y retornar 201', async () => {
      const body = { nombre: 'Andrés Mendoza', cargo: 'Arquitecto', departamento: 'TI', sueldo: 4000 };
      mockRepository.create.mockResolvedValue(fakeEmployee);
      mockRequest = { body };

      await controller.addEmpleado(mockRequest as Request<object>, mockResponse as Response);

      expect(mockRepository.create).toHaveBeenCalledWith(body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, message: 'Empleado guardado', data: fakeEmployee });
    });
  });

  describe('updateEmpleado', () => {
    it('Debería retornar 200 con el empleado actualizado', async () => {
      const body = { sueldo: 4500 };
      const actualizado = { ...fakeEmployee, sueldo: 4500 };
      mockRepository.update.mockResolvedValue(actualizado);
      mockRequest = { params: { id: ID }, body };

      await controller.updateEmpleado(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockRepository.update).toHaveBeenCalledWith(ID, body);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, message: 'Empleado actualizado', data: actualizado });
    });

    it('Debería lanzar NotFoundError (404) si la abstracción devuelve null', async () => {
      mockRepository.update.mockResolvedValue(null);
      mockRequest = { params: { id: ID }, body: { sueldo: 4500 } };

      const peticion = controller.updateEmpleado(mockRequest as Request<{ id: string }>, mockResponse as Response);

      await expect(peticion).rejects.toBeInstanceOf(NotFoundError);
      await expect(peticion).rejects.toMatchObject({ status: 404, message: 'Empleado no encontrado' });
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('deleteEmpleado', () => {
    it('Debería retornar 200 con el id eliminado', async () => {
      mockRepository.delete.mockResolvedValue(true);
      mockRequest = { params: { id: ID } };

      await controller.deleteEmpleado(mockRequest as Request<{ id: string }>, mockResponse as Response);

      expect(mockRepository.delete).toHaveBeenCalledWith(ID);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, message: 'Empleado eliminado', data: { id: ID } });
    });

    it('Debería lanzar NotFoundError (404) si el empleado no existe', async () => {
      mockRepository.delete.mockResolvedValue(false);
      mockRequest = { params: { id: ID } };

      const peticion = controller.deleteEmpleado(mockRequest as Request<{ id: string }>, mockResponse as Response);

      await expect(peticion).rejects.toBeInstanceOf(NotFoundError);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
