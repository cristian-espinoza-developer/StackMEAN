import { Schema, model } from 'mongoose';

export interface EmployeeDocument {
    nombre: string;
    cargo: string;
    departamento: string;
    sueldo: number;
    createdAt: Date;
    updatedAt: Date;
}

const employeeSchema = new Schema<EmployeeDocument>({
    nombre: { type: String, required: true },
    cargo: { type: String, required: true },
    departamento: { type: String, required: true },
    sueldo: { type: Number, required: true }
}, {
    collection: 'empleados', // colección existente
    timestamps: true,
    versionKey: false
});

export const EmployeeModel = model<EmployeeDocument>('Empleado', employeeSchema);
