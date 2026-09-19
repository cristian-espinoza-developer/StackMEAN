import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { EmployeeController } from './controllers/employee.controller.js';
import { createEmployeeRouter } from './routes/employee.routes.js';
import type { IEmployeeRepository } from './repositories/IEmployeeRepository.js';

/** Construye la aplicación Express recibiendo sus dependencias (inversión de dependencias). */
export const createApp = (employeeRepository: IEmployeeRepository) => {
    const app = express();

    // settings
    app.set('puerto', process.env.PORT || 3000);
    app.set('nombreApp', 'Gestión de empleados');

    // middlewares
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(cors());

    // rutas
    const employeeController = new EmployeeController(employeeRepository);
    app.use('/api/v1', createEmployeeRouter(employeeController));

    return app;
};
