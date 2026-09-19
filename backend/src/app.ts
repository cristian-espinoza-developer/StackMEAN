import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import empleadosRoutes from './routes/empleados.routes.js';

const app = express();

// settings
app.set('puerto', process.env.PORT || 3000);
app.set('nombreApp', 'Gestión de empleados');

// middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(cors());

// rutas
app.use('/api/v1', empleadosRoutes);

export default app;
