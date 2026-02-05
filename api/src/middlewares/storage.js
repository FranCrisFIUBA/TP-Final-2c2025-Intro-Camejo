import multer from "multer";
import * as path from "node:path";
import crypto from 'crypto';
import dotenv from "dotenv";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";

dotenv.config();

// Configuración del cliente S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

// iconos de usuario
export const iconoUsuarioUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const nombreArchivo = `iconos/${crypto.randomUUID()}${ext}`;
            cb(null, nombreArchivo);
        }
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Archivo no es una imagen'));
        }
        cb(null, true);
    }
});

// imagen de publicaciones
export const imagenPublicacionUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.S3_BUCKET_NAME,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const nombre = `imagenes/${crypto.randomUUID()}${ext}`;
            cb(null, nombre);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Archivo no es una imagen'));
        }
        cb(null, true);
    }
});
