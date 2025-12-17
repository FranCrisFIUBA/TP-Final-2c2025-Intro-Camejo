import multer from "multer";
import * as path from "node:path";
import crypto from 'crypto';

import dotenv from "dotenv";
dotenv.config();

// iconos de usuario

export const ICONOS_PATH = process.env.ICONOS_PATH || 'public/iconos';

const storageUsuarios = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/iconos'); // carpeta donde se guardarán los iconos
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombreArchivo = crypto.randomUUID() + ext; // nombre único
        cb(null, nombreArchivo);
    }
});

export const uploadUsuario = multer({
    storage: storageUsuarios,
    limits: { fileSize: 2 * 1024 * 1024 }, // máximo 2MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Archivo no es una imagen'));
        }
        cb(null, true);
    }
});

// imagen de publicaciones

export const IMAGENES_PATH = process.env.IMAGES_DEST_PATH || "public/imagenes";

export const imagenPublicacionStorage = multer.diskStorage({
    destination: IMAGENES_PATH,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombre = crypto.randomUUID() + ext;
        cb(null, nombre);
    }
})

export const imagenPublicacionUpload = multer({
    imagenPublicacionStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Archivo no es una imagen'));
        }
        cb(null, true);
    }
});
