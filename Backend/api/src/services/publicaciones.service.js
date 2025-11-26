import { pool } from "../db/connection.js";

export const getPublicaciones = async () => {
  const result = await pool.query(`
    SELECT *
    FROM publicaciones
    ORDER BY fecha_publicacion DESC
  `);

  return result.rows;
};

export const getPublicacionById = async (id) => {
  const result = await pool.query(`
    SELECT *
    FROM publicaciones
    WHERE id = $1
  `, [id]);

  return result.rows[0];
};

export const createPublicacion = async (data) => {
  const {
    usuario_id,
    titulo,
    etiquetas,
    url_imagen,
    alto_imagen,
    ancho_imagen
  } = data;

  const result = await pool.query(`
    INSERT INTO publicaciones (
      usuario_id, titulo, etiquetas, url_imagen, alto_imagen, ancho_imagen,
      fecha_publicacion, fecha_edicion
    )
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *
  `, [usuario_id, titulo, etiquetas, url_imagen, alto_imagen, ancho_imagen]);

  return result.rows[0];
};

export const updatePublicacion = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in data) {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  }

  values.push(id); // último valor para WHERE

  const result = await pool.query(`
    UPDATE publicaciones
    SET ${fields.join(", ")}, fecha_edicion = NOW()
    WHERE id = $${index}
    RETURNING *
  `, values);

  return result.rows[0];
};

export const deletePublicacion = async (id) => {
  await pool.query(`DELETE FROM publicaciones WHERE id = $1`, [id]);
};
