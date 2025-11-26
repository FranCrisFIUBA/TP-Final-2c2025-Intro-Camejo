import dotenv from 'dotenv';
import express from 'express';
import usuariosRouter from "./routes/usuarios.js";
import publicacionesRouter from "./routes/publicaciones.js";
import comentariosRouter from "./routes/comentarios.js";
import likesRouter from "./routes/likes.js";
import {logRequest} from "./middlewares/logRequest.js";
import {logResponse} from "./middlewares/logResponse.js";
import {dataDiagnostic} from "./routes/diagnostics/dataDiagnostic.js";
import {healthDiagnostic} from "./routes/diagnostics/healthDiagnostic.js";
import {testConnectionWithRetry} from "./db.js";

// carga las variables de entorno
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;

console.log('=== INICIANDO APP ===');
console.log('NODE_ENV:', NODE_ENV);
console.log('PORT:', PORT);

const app = express()

app
    .use(express.json())
    .use(logRequest)
    .use(logResponse)
    .use("/usuarios", usuariosRouter)
    .use("/publicaciones", publicacionesRouter)
    .use("/comentarios", comentariosRouter)
    .use("/likes", likesRouter)

if (NODE_ENV === "development") {
    app
        .get('/health', healthDiagnostic)
        .get('/api/data', dataDiagnostic); // Ruta para datos completos (ACTUALIZADA PARA INCLUIR LIKES REALES)
}

// Inicializar la aplicación

console.log('Probando conexión a la base de datos (con reintentos)...');

const dbConnected = await testConnectionWithRetry(10, 2000);

if (!dbConnected) {
    console.log('Iniciando sin conexión a BD...');
} else {
    console.log('Conexión a BD establecida exitosamente!');
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Data: http://localhost:${PORT}/api/data`);
    console.log(`Comentarios API: http://localhost:${PORT}/comentarios`);
});
