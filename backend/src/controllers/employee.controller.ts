import type { Request, Response } from 'express';
import type { IEmployeeRepository } from '../repositories/IEmployeeRepository.js';

/** Controlador HTTP: solo conoce la abstracción IEmployeeRepository. */
export class EmployeeController {
    constructor(private readonly repository: IEmployeeRepository) {}

    getAll = async (_req: Request, res: Response) => {
        res.json(await this.repository.findAll());
    };

    getById = async (req: Request<{ id: string }>, res: Response) => {
        const employee = await this.repository.findById(req.params.id);
        if (!employee) return res.status(404).json({ status: 'Empleado no encontrado' });
        res.json(employee);
    };

    add = async (req: Request, res: Response) => {
        const employee = await this.repository.create(req.body);
        res.status(201).json(employee);
    };

    update = async (req: Request<{ id: string }>, res: Response) => {
        const employee = await this.repository.update(req.params.id, req.body);
        if (!employee) return res.status(404).json({ status: 'Empleado no encontrado' });
        res.json(employee);
    };

    delete = async (req: Request<{ id: string }>, res: Response) => {
        const deleted = await this.repository.delete(req.params.id);
        if (!deleted) return res.status(404).json({ status: 'Empleado no encontrado' });
        res.json({ status: 'Empleado eliminado' });
    };
}
