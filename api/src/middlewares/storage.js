import multer from "multer";
import * as path from "node:path";

import dotenv from "dotenv";
dotenv.config();
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
