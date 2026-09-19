import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDatabase } from './config/database.js';
import { EmpleadoController } from './controllers/empleados.controllers.js';
import { createEmpleadosRouter } from './routes/empleados.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import { setupSwagger } from './docs/swagger.js';
import type { IEmployeeRepository } from './repositories/IEmployeeRepository.js';
import { MongoEmployeeRepository } from './infrastructure/mongodb/MongoEmployeeRepository.js';

// Composition root: único lugar que conoce la implementación concreta.
const db = await connectDatabase();
const employeeRepository: IEmployeeRepository = new MongoEmployeeRepository(db);

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
setupSwagger(app);
app.use('/api/v1', createEmpleadosRouter(new EmpleadoController(employeeRepository)));
app.use(notFoundHandler);
app.use(errorHandler); // siempre al final

app.listen(port, () => {
  console.log('Servidor escuchando en el puerto ' + port);
});
