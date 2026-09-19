import express from "express"
import {PORT} from './config.js'
import tasasRoutes from './routes/tasas.routes.js'
import morgan from 'morgan'
import cors from "cors"// necesario para permitir peticiones externas
import crypto from 'crypto';
import helmet from "helmet"


const app = express();

// seguridad básica para proteger contra ataques comunes, como XSS, clickjacking, etc.
app.use(helmet());

// Solo permitimos solicitudes desde Angular, necesario en produccion
const corsOptions = {
  //origin: "http://localhost:4200", 
  methods: "GET, POST, PUT, DELETE, OPTIONS",
  allowedHeaders: "Content-Type, Authorization",
};
// Middleware
app.use(cors()); 

app.use((req, res, next) => {
    // Generamos una longitud aleatoria (por ejemplo, entre 16 y 128 bytes)
    const paddingLength = Math.floor(Math.random() * (128 - 16 + 1)) + 16;
    
    // Creamos una cadena aleatoria
    const padding = crypto.randomBytes(paddingLength).toString('hex');
    
    // Añadimos el relleno en un encabezado personalizado
    res.setHeader('X-Response-Padding', padding);
    
    next();
});

app.use(morgan('dev'))// libreria que muestra las transacciones en la consola
app.use(express.json())// necesario para poder recibir paquetes en json
app.use(tasasRoutes);

app.listen(PORT);
console.log('Server on port', PORT)