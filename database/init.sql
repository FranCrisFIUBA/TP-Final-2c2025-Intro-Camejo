CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL, -- de 5 a 25 caracteres
    contrasenia VARCHAR NOT NULL, -- de 5 a 25 caracteres
    email VARCHAR NOT NULL,
    icono VARCHAR, -- URL al icono
    fecha_nacimiento TIMESTAMP NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE publicaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    etiquetas VARCHAR(200) NOT NULL,
    imagen VARCHAR(255) NOT NULL, -- nombre del archivo
    alto_imagen INT,
    ancho_imagen INT,
    fecha_publicacion TIMESTAMP NOT NULL DEFAULT now(),
    fecha_edicion TIMESTAMP NOT NULL DEFAULT now(),

    FOREIGN KEY (usuario_id)
       REFERENCES usuarios(id)
       ON DELETE CASCADE
);

CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    publicacion_id INT NOT NULL,
    contenido VARCHAR NOT NULL,
    fecha_publicacion TIMESTAMP NOT NULL DEFAULT now(),
    fecha_edicion TIMESTAMP NOT NULL DEFAULT now(),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (publicacion_id)
        REFERENCES publicaciones(id)
        ON DELETE CASCADE
);

CREATE TABLE listas ( /*busquedas personalizadas*/
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR NOT NULL,
    etiquetas VARCHAR,
    fecha_publicacion_min TIMESTAMP,
    fecha_publicacion_max TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE TABLE tableros (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR NOT NULL,
    etiquetas VARCHAR,
    fecha_publicacion TIMESTAMP NOT NULL DEFAULT now(),
    fecha_edicion TIMESTAMP NOT NULL DEFAULT now(),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    publicacion_id INT NOT NULL,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (publicacion_id)
        REFERENCES publicaciones(id)
        ON DELETE CASCADE,

        UNIQUE(usuario_id, publicacion_id)
);

CREATE TABLE suscripciones_a_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    publicacion_id INT NOT NULL,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (publicacion_id)
        REFERENCES publicaciones(id)
        ON DELETE CASCADE,
        
    CONSTRAINT unique_user_like UNIQUE(usuario_id, publicacion_id)
);

CREATE TABLE listas_guardadas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    lista_id INT NOT NULL,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (lista_id)
        REFERENCES listas(id)
        ON DELETE CASCADE
);

CREATE TABLE tableros_publicaciones (
    id SERIAL PRIMARY KEY,
    tablero_id INT NOT NULL,
    publicacion_id INT NOT NULL,

    FOREIGN KEY (tablero_id)
        REFERENCES tableros(id)
        ON DELETE CASCADE,

    FOREIGN KEY (publicacion_id)
        REFERENCES publicaciones(id)
        ON DELETE CASCADE,

    UNIQUE (tablero_id, publicacion_id)
);

CREATE TABLE tableros_guardados (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    tablero_id INT NOT NULL,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (tablero_id)
        REFERENCES tableros(id)
        ON DELETE CASCADE
);
