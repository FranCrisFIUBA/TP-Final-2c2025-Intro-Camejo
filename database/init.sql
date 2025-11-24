-- Esta query tiene como objetivo generar las tablas necesarias al iniciar la base de datos.

-- TODO: tabla usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY,
    nombre CHAR(24) NOT NULL, -- de 5 a 25 caracteres
    contrasenia CHAR(24) NOT NULL, -- de 5 a 25 caracteres
    email VARCHAR NOT NULL,
    icono VARCHAR NOT NULL, -- URL al icono
    fecha_nacimiento TIMESTAMP NOT NULL,
    fecha_registro TIMESTAMP NOT NULL
);

-- TODO: tabla publicaciones
-- TODO: tabla likes usuarios a publicaciones
-- TODO: tabla comentarios
-- TODO: tabla listas
-- TODO: tabla usuarios a listas
-- TODO: tabla tableros
-- TODO: tabla usuarios a tableros
