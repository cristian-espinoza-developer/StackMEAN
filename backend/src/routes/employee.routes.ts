import { Router } from 'express';
import type { EmployeeController } from '../controllers/employee.controller.js';

export const createEmployeeRouter = (controller: EmployeeController): Router => {
    const router = Router();

    router.get('/empleados', controller.getAll);
    router.get('/empleados/:id', controller.getById);
    router.post('/empleados', controller.add);
    router.put('/empleados/:id', controller.update);
    router.delete('/empleados/:id', controller.delete);

    return router;
};
