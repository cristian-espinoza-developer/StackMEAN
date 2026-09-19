import { isValidObjectId, type Types } from 'mongoose';
import type { CreateEmployeeData, Employee, UpdateEmployeeData } from '../../domain/employee.js';
import type { IEmployeeRepository } from '../IEmployeeRepository.js';
import { EmployeeModel, type EmployeeDocument } from './EmployeeModel.js';

type EmployeeRecord = EmployeeDocument & { _id: Types.ObjectId };

/** Traduce el registro de Mongo a la entidad de dominio (sin filtrar `_id` al exterior). */
const toDomain = (record: EmployeeRecord): Employee => ({
    id: record._id.toString(),
    nombre: record.nombre,
    cargo: record.cargo,
    departamento: record.departamento,
    sueldo: record.sueldo,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
});

export class MongooseEmployeeRepository implements IEmployeeRepository {
    async findAll(): Promise<Employee[]> {
        const records = await EmployeeModel.find().lean<EmployeeRecord[]>();
        return records.map(toDomain);
    }

    async findById(id: string): Promise<Employee | null> {
        if (!isValidObjectId(id)) return null;
        const record = await EmployeeModel.findById(id).lean<EmployeeRecord>();
        return record ? toDomain(record) : null;
    }

    async create(data: CreateEmployeeData): Promise<Employee> {
        const created = await EmployeeModel.create(data);
        return toDomain(created.toObject() as EmployeeRecord);
    }

    async update(id: string, data: UpdateEmployeeData): Promise<Employee | null> {
        if (!isValidObjectId(id)) return null;
        const record = await EmployeeModel
            .findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .lean<EmployeeRecord>();
        return record ? toDomain(record) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!isValidObjectId(id)) return false;
        const deleted = await EmployeeModel.findByIdAndDelete(id);
        return deleted !== null;
    }
}
