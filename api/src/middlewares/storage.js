import multer from "multer";
import * as path from "node:path";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

// true: usar AWS S3. false usa almacenamiento local
export const USE_S3 = process.env.USE_S3 === "true";

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const API_BASE_URL = process.env.API_BASE_URL || ("http://localhost:" + (process.env.PORT || 3000));
export const LOCAL_ICONOS_PATH = process.env.ICONOS_PATH || "public/iconos";
export const LOCAL_IMAGENES_PATH = process.env.IMAGENES_PATH || "public/imagenes";

// --- Configuración S3 ---
let s3, s3ClientV3;
if (USE_S3) {
    s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
        region: process.env.AWS_REGION,
    });

    s3ClientV3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        },
    });
}

// --- Función para generar URLs temporales ---
export async function getFileUrl(key, folder) {
    if (USE_S3) {
        const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
        return await getSignedUrl(s3ClientV3, command, { expiresIn: 600 });
    } else {
        // URL pública local: api_url/directorio/nombre
        return `${API_BASE_URL}/${folder}/${key}`;
    }
}

/**
 * Elimina un archivo del storage dinámico
 * @param {string} filePath - Para S3, la "key" (iconos/uuid.png). Para local, el nombre relativo al directorio.
 */
export async function deleteFile(filePath) {
    if (!filePath) return;

    if (USE_S3) {
        const bucket = process.env.S3_BUCKET_NAME;
        try {
            await s3
                .deleteObject({
                    Bucket: bucket,
                    Key: filePath
                })
                .promise();
            console.log(`Archivo S3 eliminado: ${filePath}`);
        } catch (err) {
            console.error('Error al eliminar archivo S3:', err);
            throw err;
        }
    } else {
        // Local
        let localPath = filePath.startsWith('iconos/')
            ? path.join(LOCAL_ICONOS_PATH, path.basename(filePath))
            : path.join(LOCAL_IMAGENES_PATH, path.basename(filePath));

        if (fs.existsSync(localPath)) {
            try {
                fs.unlinkSync(localPath);
                console.log(`Archivo local eliminado: ${localPath}`);
            } catch (err) {
                console.error('Error al eliminar archivo local:', err);
                throw err;
            }
        }
    }
}

// --- Helper para crear storage Multer ---
function createMulterStorage(folder, maxSizeMB) {
    if (USE_S3) {
        return multer({
            storage: multerS3({
                s3: s3,
                bucket: BUCKET_NAME,
                acl: "private", // privado, se usa URL temporal
                contentType: multerS3.AUTO_CONTENT_TYPE,
                key: (req, file, cb) => {
                    const ext = path.extname(file.originalname);
                    cb(null, `${folder}/${crypto.randomUUID()}${ext}`);
                },
            }),
            limits: { fileSize: maxSizeMB * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith("image/")) return cb(new Error("Archivo no es una imagen"));
                cb(null, true);
            },
        });
    } else {
        const LOCAL_PATH = path.join(process.cwd(), "public", folder);
        if (!fs.existsSync(LOCAL_PATH)) fs.mkdirSync(LOCAL_PATH, { recursive: true });

        return multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => cb(null, LOCAL_PATH),
                filename: (req, file, cb) => {
                    const ext = path.extname(file.originalname);
                    cb(null, `${crypto.randomUUID()}${ext}`);
                },
            }),
            limits: { fileSize: maxSizeMB * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith("image/")) return cb(new Error("Archivo no es una imagen"));
                cb(null, true);
            },
        });
    }
}

// --- Exportar storages ---
export const iconoUsuarioUpload = createMulterStorage("iconos", 2);
export const imagenPublicacionUpload = createMulterStorage("imagenes", 10);
