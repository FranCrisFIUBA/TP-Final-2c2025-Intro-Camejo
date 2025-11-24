-- Esta query tiene como objetivo generar las tablas necesarias al iniciar la base de datos.

CREATE TABLE usuarios (
    id INT PRIMARY KEY,
    nombre CHAR(24) NOT NULL, -- de 5 a 25 caracteres
    contrasenia CHAR(24) NOT NULL, -- de 5 a 25 caracteres
    email VARCHAR NOT NULL,
    icono VARCHAR NOT NULL, -- URL al icono
    fecha_nacimiento TIMESTAMP NOT NULL,
    fecha_registro TIMESTAMP NOT NULL
);

CREATE TABLE publicaciones (
    id INT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR NOT NULL,
    etiquetas VARCHAR,
    url_imagen VARCHAR NOT NULL, -- url que indica donde se encuentra la imagen, apunta a un archivo publico del servidor
    alto_imagen INT, -- alto arreglado (fixed) opcional de la imagen
    ancho_imagen INT, -- ancho arreglado (fixed) opcional de la imagen
    fecha_publicacion TIMESTAMP NOT NULL,
    fecha_edicion TIMESTAMP NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE comentarios (
    id INT PRIMARY KEY,
    usuario_id INT NOT NULL,
    publicacion_id INT NOT NULL,
    contenido VARCHAR NOT NULL,
    fecha_publicacion TIMESTAMP NOT NULL,
    fecha_edicion TIMESTAMP NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id)
);

CREATE TABLE listas (
    id INT PRIMARY KEY,
    usuario_id INT NOT NULL, -- autor
    titulo VARCHAR NOT NULL,
    etiquetas VARCHAR,
    fecha_publicacion_min TIMESTAMP,
    fecha_publicacion_max TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE tableros (
    id INT PRIMARY KEY,
    usuario_id INT NOT NULL, -- autor
    titulo VARCHAR NOT NULL,
    etiquetas VARCHAR,
    fecha_publicacion TIMESTAMP NOT NULL,
    fecha_edicion TIMESTAMP NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE suscripciones_a_usuarios (
    id INT PRIMARY KEY,
    usuario_id INT NOT NULL,
    susciptor_id INT NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (susciptor_id) REFERENCES usuarios(id)
);

CREATE TABLE listas_guardadas (
    id INT PRIMARY KEY,
    usuario_id INT NOT NULL,
    lista_id INT NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (lista_id) REFERENCES listas(id)
);

CREATE TABLE tableros_guardados (
    id INT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tablero_id INT NOT NULL,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (tablero_id) REFERENCES tableros(id)
);
