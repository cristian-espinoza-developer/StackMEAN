import { Router } from 'express';
import * as empleado from '../controllers/empleados.controllers.js';

const router = Router();

router.get('/empleados', empleado.getEmpleado);
router.post('/empleados', empleado.addEmpleado);
router.put('/empleados/:id', empleado.updateEmpleado);
router.delete('/empleados/:id', empleado.deleteEmpleado);

export default router;
