import multer from "multer";
import * as path from "node:path";
import crypto from "crypto";
import fs from "fs";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

export const USE_S3 = process.env.USE_S3 === "true";

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const API_BASE_URL = process.env.API_BASE_URL || ("http://localhost:" + (process.env.PORT || 3000));
export const LOCAL_ICONOS_PATH = process.env.ICONOS_PATH || "public/iconos";
export const LOCAL_IMAGENES_PATH = process.env.IMAGENES_PATH || "public/imagenes";

// --- Cliente S3 v3 ---
let s3Client;
if (USE_S3) {
    console.log("=== USANDO S3 PARA STORAGE ===");
    s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        },
    });
} else {
    console.log("=== USANDO ALMACENAMIENTO LOCAL ===");
}

// --- Función para generar URLs temporales ---
export async function getFileUrl(key, folder) {
    if (USE_S3) {
        const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
        return await getSignedUrl(s3Client, command, { expiresIn: 600 });
    } else {
        return `${API_BASE_URL}/${folder}/${key}`;
    }
}

// --- Eliminar archivo ---
export async function deleteFile(filePath) {
    if (!filePath) return;

    if (USE_S3) {
        try {
            await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: filePath }));
            console.log(`Archivo S3 eliminado: ${filePath}`);
        } catch (err) {
            console.error("Error al eliminar archivo S3:", err);
            throw err;
        }
    } else {
        const localPath = filePath.startsWith("iconos/")
            ? path.join(LOCAL_ICONOS_PATH, path.basename(filePath))
            : path.join(LOCAL_IMAGENES_PATH, path.basename(filePath));

        if (fs.existsSync(localPath)) {
            try {
                fs.unlinkSync(localPath);
                console.log(`Archivo local eliminado: ${localPath}`);
            } catch (err) {
                console.error("Error al eliminar archivo local:", err);
                throw err;
            }
        }
    }
}

// --- Middleware Multer que funciona igual que antes ---
function createMulterStorage(folder, maxSizeMB) {
    if (USE_S3) {
        const storage = multer.memoryStorage(); // Memoria antes de subir a S3
        const upload = multer({
            storage,
            limits: { fileSize: maxSizeMB * 1024 * 1024 },
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.startsWith("image/")) return cb(new Error("Archivo no es una imagen"));
                cb(null, true);
            },
        });

        return {
            single: (fieldName) => async (req, res, next) => {
                upload.single(fieldName)(req, res, async (err) => {
                    if (err instanceof multer.MulterError) {
                        console.error("MulterError:", err);
                        return res.status(400).json({ error: err.message });
                    } else if (err) {
                        console.error("Error en Multer:", err);
                        return res.status(500).json({ error: "Error en la subida de archivo" });
                    }

                    if (req.file) {
                        const ext = path.extname(req.file.originalname);
                        const key = `${folder}/${crypto.randomUUID()}${ext}`;
                        console.log("Subiendo archivo a S3 con key:", key);

                        try {
                            await s3Client.send(new PutObjectCommand({
                                Bucket: BUCKET_NAME,
                                Key: key,
                                Body: req.file.buffer,
                                ContentType: req.file.mimetype,
                            }));
                            req.file.key = key;       // clave S3
                            req.file.filename = key;  // para compatibilidad con endpoints existentes
                        } catch (err) {
                            console.error("Error subiendo a S3:", err);
                            return res.status(500).json({ error: "Error en la subida de archivo" });
                        }
                    }

                    next();
                });
            },
        };
    } else {
        // Almacenamiento local igual que antes
        const LOCAL_PATH = path.join(process.cwd(), "public", folder);
        if (!fs.existsSync(LOCAL_PATH)) fs.mkdirSync(LOCAL_PATH, { recursive: true });

        return multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => cb(null, LOCAL_PATH),
                filename: (req, file, cb) => {
                    const ext = path.extname(file.originalname);
                    const filename = `${crypto.randomUUID()}${ext}`;
                    console.log("Subiendo archivo local:", filename);
                    cb(null, filename);
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

// --- Exportar ---
export const iconoUsuarioUpload = createMulterStorage("iconos", 2);
export const imagenPublicacionUpload = createMulterStorage("imagenes", 10);