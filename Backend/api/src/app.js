// carga las variables de entorno
import dotenv from 'dotenv';
dotenv.config();

console.log('=== INICIANDO APP ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

const PORT = process.env.PORT || 3000;

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import usuarioRouter from "./routes/usuarioRouter.js";
import publicacionRouter from "./routes/publicacionRouter.js";
import comentarioRouter from "./routes/comentarioRouter.js";
import likeRouter from "./routes/likeRouter.js";
import { testConnectionWithRetry, pool } from "./db/connection.js";

const app = express();
app.use(express.static('/app/frontend'));

app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

app.get('/health', async (req, res) => {
    try {
        const client = await pool.connect();
        const dbResult = await client.query('SELECT 1 as test');
        client.release();
        res.status(200).json({
            status: 'OK',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(200).json({
            status: 'OK',
            database: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});

// Rutas de API
app.use("/usuarios", usuarioRouter);
app.use("/publicaciones", publicacionRouter);
app.use("/comentarios", comentarioRouter); 
app.use("/likes", likeRouter);

// Ruta para datos completos (ACTUALIZADA PARA INCLUIR LIKES REALES)
app.get('/api/data', async (req, res) => {
    try {
        console.log('Solicitando datos completos...');
        
        // Obtener usuarios
        const usuariosResult = await pool.query(`
            SELECT 
                id,
                nombre as username,
                icono as avatar,
                fecha_registro
            FROM usuarios 
            ORDER BY id
        `);
        
        // Obtener publicaciones (cards)
        const publicacionesResult = await pool.query(`
            SELECT 
                p.id,
                p.titulo as title,
                p.url_imagen as image,
                p.ancho_imagen as width,
                p.alto_imagen as height,
                p.fecha_publicacion as "publishDate",
                p.fecha_edicion as "fecha_actualizacion",
                p.etiquetas,
                p.usuario_id as "id_author",
                u.nombre as "authorName",
                u.icono as "authorAvatar"
            FROM publicaciones p 
            JOIN usuarios u ON p.usuario_id = u.id 
            ORDER BY p.id
        `);
        
        // Obtener conteo de likes por publicación
        const likesResult = await pool.query(`
            SELECT 
                publicacion_id,
                COUNT(*) as like_count
            FROM likes 
            GROUP BY publicacion_id
        `);
        
        // Obtener comentarios para cada publicación
        const comentariosResult = await pool.query(`
            SELECT 
                c.publicacion_id,
                c.contenido as text,
                c.fecha_publicacion as date,
                u.nombre as author,
                u.icono as avatar
            FROM comentarios c
            JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.fecha_publicacion ASC
        `);
        
        // Crear mapa de likes por publicación
        const likesPorPublicacion = {};
        likesResult.rows.forEach(like => {
            likesPorPublicacion[like.publicacion_id] = parseInt(like.like_count);
        });
        
        // Agrupar comentarios por publicación
        const comentariosPorPublicacion = {};
        comentariosResult.rows.forEach(comentario => {
            if (!comentariosPorPublicacion[comentario.publicacion_id]) {
                comentariosPorPublicacion[comentario.publicacion_id] = [];
            }
            comentariosPorPublicacion[comentario.publicacion_id].push({
                author: comentario.author,
                avatar: comentario.avatar,
                text: comentario.text,
                date: comentario.date
            });
        });
        
        // Transformar publicaciones al formato de cards CON LIKES REALES
        const cards = publicacionesResult.rows.map(publicacion => ({
            id: publicacion.id,
            title: publicacion.title,
            image: publicacion.image,
            authorAvatar: publicacion.authorAvatar,
            publishDate: publicacion.publishDate,
            id_author: publicacion.id_author,
            authorName: publicacion.authorName,
            likes: likesPorPublicacion[publicacion.id] || 0, // LIKES REALES
            width: publicacion.width,
            height: publicacion.height,
            fecha_actualizacion: publicacion.fecha_actualizacion,
            hashtags: publicacion.etiquetas ? 
                publicacion.etiquetas.split(',').map(tag => `#${tag.trim()}`) : [],
            comments: comentariosPorPublicacion[publicacion.id] || [],
            userLiked: false // Se establecerá en el frontend
        }));
        
        const response = {
            usuarios: usuariosResult.rows,
            cards: cards
        };
        
        console.log('Datos completos preparados:', {
            usuarios: usuariosResult.rows.length,
            cards: cards.length,
            likes_totales: likesResult.rows.length,
            comentarios_totales: comentariosResult.rows.length
        });
        
        res.status(200).json(response);
    } catch (err) {
        console.error('Error en /api/data:', err);
        res.status(500).json({ error: "Error al obtener datos" });
    }
});

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/usuarios') && 
        !req.path.startsWith('/publicaciones') && !req.path.startsWith('/comentarios') && 
        !req.path.startsWith('/health')) {
        res.sendFile('/app/frontend/index.html');
    } else {
        res.status(404).json({ error: 'Ruta no encontrada' });
    }
});

// Inicializar la aplicación
async function startServer() {
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
        console.log(`Frontend disponible en: http://localhost:${PORT}`);
        console.log(`API Data: http://localhost:${PORT}/api/data`);
        console.log(`Comentarios API: http://localhost:${PORT}/comentarios`);
    });
}

startServer();