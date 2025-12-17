import multer from "multer";
import * as path from "node:path";
import crypto from 'crypto';
import fs from 'fs';

import dotenv from "dotenv";
dotenv.config();

// iconos de usuario

export const ICONOS_PATH = process.env.ICONOS_PATH || 'public/iconos';

if (!fs.existsSync(ICONOS_PATH)) {
    fs.mkdirSync(ICONOS_PATH, { recursive: true });
}

const iconoUsuarioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/iconos'); // carpeta donde se guardarán los iconos
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombreArchivo = crypto.randomUUID() + ext; // nombre único
        cb(null, nombreArchivo);
    }
});

export const iconoUsuarioUpload = multer({
    storage: iconoUsuarioStorage,
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

if (!fs.existsSync(IMAGENES_PATH)) {
    fs.mkdirSync(IMAGENES_PATH, { recursive: true });
}

const imagenPublicacionStorage = multer.diskStorage({
    destination: IMAGENES_PATH,
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const nombre = crypto.randomUUID() + ext;
        cb(null, nombre);
    }
})

export const imagenPublicacionUpload = multer({
    imagenPublicacionStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Archivo no es una imagen'));
        }
        cb(null, true);
    }
});
