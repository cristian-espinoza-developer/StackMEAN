import type { CreateEmployeeData, Employee, UpdateEmployeeData } from '../domain/employee.js';

export interface IEmployeeRepository {
  findAll(): Promise<Employee[]>;

  create(data: CreateEmployeeData): Promise<Employee>;
  
  
  update(id: string, data: UpdateEmployeeData): Promise<Employee | null>;


  delete(id: string): Promise<boolean>;
}
