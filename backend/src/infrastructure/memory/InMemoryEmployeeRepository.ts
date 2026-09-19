import { randomBytes } from 'node:crypto';
import { definedFields, type CreateEmployeeData, type Employee, type UpdateEmployeeData } from '../../domain/employee.js';
import type { IEmployeeRepository } from '../../repositories/IEmployeeRepository.js';

export class InMemoryEmployeeRepository implements IEmployeeRepository {
  private readonly employees = new Map<string, Employee>();

  async findAll(): Promise<Employee[]> {
    return [...this.employees.values()];
  }

  async create(data: CreateEmployeeData): Promise<Employee> {
    const now = new Date();
    // Mismo formato de id que el contrato del API (24 caracteres hexadecimales).
    const employee: Employee = { ...data, id: randomBytes(12).toString('hex'), createdAt: now, updatedAt: now };
    this.employees.set(employee.id, employee);
    return employee;
  }

  async update(id: string, data: UpdateEmployeeData): Promise<Employee | null> {
    const current = this.employees.get(id);
    if (!current) return null;
    const updated: Employee = { ...current, ...definedFields(data), updatedAt: new Date() };
    this.employees.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }
}
