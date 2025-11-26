-- Esta query tiene como objetivo generar las tablas necesarias al iniciar la base de datos.

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    contrasenia VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    icono TEXT,
    fecha_nacimiento DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO usuarios (nombre, contrasenia, email, icono, fecha_nacimiento) VALUES
('Cath_786', 'password123', 'catherine@ejemplo.com', 'https://i.pinimg.com/1200x/fe/dc/3a/fedc3ac9e3518739bc6557abf20420fa.jpg', '1990-01-01'),
('PawPaw', 'clave123', 'artista1@email.com', 'https://i.pinimg.com/1200x/43/91/3c/43913ca5b2ceac42e28417ddbc8ad3d7.jpg', '1995-05-15'),
('HappyU_', 'design456', 'design@ejemplo.com', 'https://i.pinimg.com/1200x/b6/cd/98/b6cd9837ce66c363ed2bf1d0e551d2ea.jpg', '1988-07-20'),
('Luna_Art', 'passLuna', 'luna_art@redsocial.com', 'https://i.pinimg.com/736x/fd/7f/bb/fd7fbb8011227ffd6ecd72b32afc2705.jpg', '1998-03-22'),
('Mountain_Explorer', 'passMountain', 'mountain_explorer@redsocial.com', 'https://i.pinimg.com/736x/15/ec/68/15ec682655c2b36b04a7bce98184899b.jpg', '1992-11-05'),
('Forest_Dreamer', 'passForest', 'forest_dreamer@redsocial.com', 'https://i.pinimg.com/736x/f8/75/92/f87592c9508d214b320928dc5e0dd4ea.jpg', '1996-06-17'),
('Sky_Watcher', 'passSky', 'sky_watcher@redsocial.com', 'https://i.pinimg.com/736x/73/79/01/737901410f86deb57a2fcccb99418fd1.jpg', '1994-09-01'),
('Golden_Hour', 'passGolden', 'golden_hour@redsocial.com', 'https://i.pinimg.com/736x/27/e9/6e/27e96e3b3b28dd4d9a8d94e2a8a0a93c.jpg', '2000-02-28'),
('Wild_Spirit_Adventures', 'passWild', 'wild_spirit@redsocial.com', 'https://i.pinimg.com/736x/90/6f/f0/906ff07281be2f362d033e7c5c4f013e.jpg', '1991-04-10'),
('Nature_Lover', 'passNature', 'nature_lover@redsocial.com', 'https://i.pinimg.com/736x/d1/33/a8/d133a82b5bfa93c91271baefedf66f0e.jpg', '1985-12-03'),
('Urban_189', 'passUrban', 'urban_explorer@redsocial.com', 'https://i.pinimg.com/1200x/91/10/ea/9110ea8ee4374256f01f6c913b3d488d.jpg', '1993-08-25'),
('Yasnin_12!', 'passColor', 'color_palette@redsocial.com', 'https://i.pinimg.com/736x/89/5d/9e/895d9e5a59fc4267ff4c523f50349d32.jpg', '1997-01-08'),
('Moon_Blog', 'passSeasonal', 'seasonal_moods@redsocial.com', 'https://i.pinimg.com/736x/91/69/8d/91698d0a8419670bc940525a75275038.jpg', '1999-07-14'),
('Kristal_<3', 'passWater', 'water_flow@redsocial.com', 'https://i.pinimg.com/736x/f8/75/92/f87592c9508d214b320928dc5e0dd4ea.jpg', '1990-10-29')
ON CONFLICT (nombre) DO NOTHING;


CREATE TABLE IF NOT EXISTS publicaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    etiquetas VARCHAR(200) NOT NULL,
    url_imagen VARCHAR(500) NOT NULL,
    alto_imagen INT,
    ancho_imagen INT,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_edicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT INTO publicaciones (usuario_id, titulo, etiquetas, url_imagen, alto_imagen, ancho_imagen) VALUES
(1, 'Ilustracion sobre fotografia', 'conejitos, osito, animales, kawaii, tierno, ilustracion, fotografia', 'https://i.pinimg.com/736x/ca/0d/89/ca0d895b5363ce3de689782101800ec5.jpg', 600, 300),
(2, 'Gatito negro dibujo', 'gato, negro, ilustracion, felino, noche', 'https://i.pinimg.com/736x/a4/83/aa/a483aab604cb2f0dd08ed6f5039415e8.jpg', 300, 500),
(2, 'Coroline - fanart', 'corolineYLaPuertaSecreta, ilustracion, gato, coroline, fanArt, Coroline', 'https://i.pinimg.com/736x/fe/97/bf/fe97bff9757f1d3a62b2c6f85d5518ba.jpg', 200, 200),
(2, 'Hello Kitty', 'fresas, arte, pixelart, helloKitty, ilustración', 'https://i.pinimg.com/736x/5a/34/dd/5a34dd2af2b588a918606a6941d1525a.jpg', NULL, NULL), 
(5, 'Ilustracion de botones', 'botones, variedad, coloresPasteles, ilustracion, botones', 'https://i.pinimg.com/1200x/36/0c/37/360c3792decff497b714a7ad2d35b95e.jpg', NULL, NULL),
(6, 'Sailor Moon - <3', 'divertido, gracioso, arte, ilustracion, sailorMoon', 'https://i.pinimg.com/736x/f5/e2/e0/f5e2e0ec13df81a51a095c7ed55362fb.jpg', NULL, NULL),
(7, 'El viaje de Chihiro', 'elViajeDeChihiro, ilustracion, bolasDePolvo, gibli, estudioGibli', 'https://i.pinimg.com/1200x/5a/fa/08/5afa082bdcfbba4bd3a16d20cca6c759.jpg', NULL, NULL),
(8, 'Girl ilustration - violet', 'morado, dibujo, chica, retrato, practicaDibujo', 'https://i.pinimg.com/736x/01/50/a7/0150a76cc532df1c0364c78e51cfdd86.jpg', 700, 400),
(9, 'Mi taza de ceramica favorita', 'payaso, taza, colore, ceramica, única', 'https://i.pinimg.com/736x/a1/48/9b/a1489b19bfcc06993e5f57b3f21dfb21.jpg', NULL, NULL),
(10, 'Diseño de uñas', 'uñas, colore, rojo, rosa, azul, celeste, manos', 'https://i.pinimg.com/736x/2f/57/ca/2f57caa72507d22a13586e32381e64dc.jpg', NULL, NULL),
(11, 'Sailor Moon - fondo de pantalla', 'sailorMoon, fondoDePantalla, colores, dibujo, ilustracionDigital', 'https://i.pinimg.com/736x/22/fa/b5/22fab5d1f3cc9534c5e5234258c7f0f5.jpg', NULL, NULL),
(12, 'Papá de Ponio - Ponyo', 'estudioGIbli, ponyo, sirenita, Gibli', 'https://i.pinimg.com/736x/fd/82/2f/fd822f26268946b6f10e20069384a817.jpg', 200, 200),
(13, 'fondo de pantalla de peliculas del estudio Gibli', 'Gibli, fondoDePantalla, pelicula, peliculas, fondoDeTelefono', 'https://i.pinimg.com/1200x/a4/5d/bc/a45dbccdaaf1d2c3359403ab1ee8337e.jpg', NULL, NULL),
(3, 'Jinx y Asha - Arcane', 'arcane, jinx, asha, ojos, ilustracion, serie, leagueOfLegends', 'https://i.pinimg.com/736x/77/98/1f/77981f4bf60d5c1d21b4d7f60511f80e.jpg', NULL, NULL),
(4, 'El Gato con Botas', 'gatoConBotas, dreamworks, ilustracion, gato, aventuras', 'https://i.pinimg.com/1200x/75/e9/6e/75e96ec3b4372a0e85a9803a92841580.jpg', NULL, NULL),
(3, 'Powder y Echo - Arcane', 'arcane, powder, echo, hermanas, emocion, serie, animacion', 'https://i.pinimg.com/736x/87/04/2e/87042ebb24e9f90389d28ac659c7c9c9.jpg', NULL, NULL),
(14, 'Sakura en Kimono', 'sakura, cardCaptor, kimono, anime, clasico, nostalgia', 'https://i.pinimg.com/736x/be/e9/6d/bee96d7525bf3929553c9919ec27cf68.jpg', 490, 310),
(14, 'Broches de Pelo Decorativos', 'broches, pelo, accesorios, decoracion, manualidades, colores', 'https://i.pinimg.com/736x/79/ad/81/79ad81935581994b4dffa50f522149fe.jpg', 230, 180),
(11, 'Grullas de Origami', 'origami, grullas, papel, decoracion, manualidades, japones', 'https://i.pinimg.com/736x/d4/c9/d8/d4c9d8d5c259c83ac6b8608c6f052c78.jpg', 340, 260),
(1, 'Estrellas Decorativas', 'estrellas, decoracion, habitacion, luces, magico, noche', 'https://i.pinimg.com/736x/86/ab/8c/86ab8c22880c93e4bf5f638f08b3fc78.jpg', 290, 220),
(1, 'Pantalón Jean Café', 'moda, pantalon, jean, cafe, outfit, estilo, casual', 'https://i.pinimg.com/1200x/64/71/eb/6471eb6eac6e332adfb40c5babf1e6f1.jpg', 180, 150),
(12, 'Ilustración Azul Estrella', 'azul, estrella, ilustracion, abstracto, colores, arteDigital', 'https://i.pinimg.com/1200x/cf/ea/dd/cfeaddfb3953608a48428ee66a02f067.jpg', NULL, NULL),
(3, 'Alice Tierna', 'alice, ilustracion, tierno, suave, coloresPasteles, fantasia', 'https://i.pinimg.com/736x/76/fc/89/76fc89c333bd44f8211c5af1437b09bb.jpg', 370, 240),
(7, 'Gato Azul K-pop', 'kpop, demonsHunters, gato, azul, anime, musica, coreano', 'https://i.pinimg.com/736x/bd/15/09/bd1509e29bebfc5c0037cd81a0ed6a95.jpg', 520, 330);

CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    publicacion_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_edicion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE
);

INSERT INTO comentarios (usuario_id, publicacion_id, contenido) VALUES
(2, 1, '¡Qué ilustración tan adorable! Me encantan los conejitos'),
(3, 1, 'Los colores son perfectos 😍'),
(4, 1, '¿Qué técnica usaste para esta ilustración?'),
(1, 2, 'Los gatos negros son mis favoritos 🐈‍⬛'),
(5, 2, 'Hermoso trabajo con las sombras'),
(6, 3, 'Coroline es una de mis películas favoritas!'),
(7, 3, 'El gato se ve exactamente como en la película'),
(8, 4, 'Hello Kitty nunca pasa de moda 💕'),
(9, 5, 'Me encanta la variedad de botones'),
(10, 6, 'Sailor Moon forever! 🌙');


CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    publicacion_id INT NOT NULL,
    fecha_like TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    UNIQUE(usuario_id, publicacion_id) -- Evitar likes duplicados
);

INSERT INTO likes (usuario_id, publicacion_id, fecha_like) VALUES
(1, 2),
(1, 4),
(1, 5),
(1, 10),
(2, 1),
(3, 4),
(9, 4);

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
