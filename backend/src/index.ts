import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';

const port = app.get('puerto');

connectDatabase(); // Conexión a la base de datos

app.listen(port, () => {
    console.log('Servidor escuchando en el puerto ' + port);
});
