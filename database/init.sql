CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR NOT NULL, -- de 5 a 25 caracteres
    contrasenia VARCHAR NOT NULL, -- de 5 a 25 caracteres
    email VARCHAR NOT NULL,
    icono VARCHAR, -- URL al icono
    fecha_nacimiento TIMESTAMP NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT now()
);
/*
INSERT INTO usuarios (nombre, contrasenia, email, icono, fecha_nacimiento, fecha_registro) VALUES
('Cath_786', 'P4ssw0rd_Test', 'catherine@ejemplo.com', 'https://i.pinimg.com/1200x/fe/dc/3a/fedc3ac9e3518739bc6557abf20420fa.jpg', '1990-01-01', '2010-01-01'),
('PawPaw', 'P4ssw0rd_Test', 'artista1@email.com', 'https://i.pinimg.com/736x/91/6a/53/916a53bbba82d022dab83c619d90a38a.jpg', '1995-05-15', '2015-05-15'),
('HappyU_', 'P4ssw0rd_Test', 'design@ejemplo.com', NULL , '1988-07-20', '2008-07-20'),
('Luna_Art', 'P4ssw0rd_Test', 'luna_art@redsocial.com', 'https://i.pinimg.com/736x/0c/88/46/0c8846e584e3f311c85c8dea8e98de48.jpg', '1998-03-22', '2008-03-22'),
('Moon_<3', 'P4ssw0rd_Test', 'mia@redsocial.com', 'https://i.pinimg.com/736x/b8/7c/69/b87c69898c892b21c150462a03594eca.jpg', '2002-11-05', '1992-11-05'),
('Dreamer', 'P4ssw0rd_Test', 'dreamer@redsocial.com', 'https://i.pinimg.com/1200x/a6/a6/fa/a6a6fa24a79ecff8a937ba173a6c987f.jpg', '1996-06-17', '2016-06-17'),
('Sky_Watcher', 'P4ssw0rd_Test', 'sky_watcher@redsocial.com', 'https://i.pinimg.com/736x/1c/66/44/1c6644438b1314251d9963c09def71e2.jpg', '1994-09-01', '2014-09-01'),
('Golden_Hour', 'P4ssw0rd_Test', 'golden_hour@redsocial.com', 'https://i.pinimg.com/736x/27/e9/6e/27e96e3b3b28dd4d9a8d94e2a8a0a93c.jpg', '2000-02-28', '2023-02-28'),
('Wild_Spirit_Adventures', 'P4ssw0rd_Test', 'wild_spirit@redsocial.com', 'https://i.pinimg.com/736x/90/6f/f0/906ff07281be2f362d033e7c5c4f013e.jpg', '1991-04-10', '2011-04-10'),
('Nat_Lover', 'P4ssw0rd_Test', 'nature_lover@redsocial.com', 'https://i.pinimg.com/1200x/ec/3e/fd/ec3efd1abba9593d9a19de14b85219f2.jpg', '1985-12-03', '2015-12-03'),
('Urs_★', 'P4ssw0rd_Test', 'urban_explorer@redsocial.com', 'https://i.pinimg.com/736x/ae/aa/b2/aeaab2657dfa7ec6ea4f2ff9be35c6a8.jpg', '1993-08-25', '2023-08-25'),
('Yasnin_12!', 'P4ssw0rd_Test', 'color_palette@redsocial.com', 'https://i.pinimg.com/736x/89/5d/9e/895d9e5a59fc4267ff4c523f50349d32.jpg', '1997-01-08', '2013-08-25'),
('Moon_Blog', 'P4ssw0rd_Test', 'seasonal_moods@redsocial.com', 'https://i.pinimg.com/736x/91/69/8d/91698d0a8419670bc940525a75275038.jpg', '1999-07-14', '2009-08-25'),
('Kristal_<3', 'P4ssw0rd_Test', 'water_flow@redsocial.com', 'https://i.pinimg.com/736x/2d/70/bd/2d70bd84b0734f51d53d9ed478267c80.jpg', '1990-10-29', '2021-08-25')
ON CONFLICT (nombre) DO NOTHING;
*/

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
    likes INT DEFAULT 0, -- conteo de likes a modo de cache

    FOREIGN KEY (usuario_id)
       REFERENCES usuarios(id)
       ON DELETE CASCADE
);

/*
INSERT INTO publicaciones (usuario_id, titulo, etiquetas, imagen, alto_imagen, ancho_imagen, fecha_publicacion, fecha_edicion) VALUES
(1, 'Ilustracion sobre fotografia', 'conejitos, osito, animales, kawaii, tierno, ilustracion, fotografia', 'https://i.pinimg.com/736x/ca/0d/89/ca0d895b5363ce3de689782101800ec5.jpg', 600, 300, '2024-01-15 10:30:00', '2024-01-15 10:30:00'),
(1, 'Gatito negro dibujo', 'gato, negro, ilustracion, felino, noche', 'https://i.pinimg.com/736x/a4/83/aa/a483aab604cb2f0dd08ed6f5039415e8.jpg', 300, 500, '2024-02-10 15:45:00', '2024-02-12 09:00:00'),
(3, 'Coroline - fanart', 'corolineYLaPuertaSecreta, ilustracion, gato, coroline, fanArt, Coroline', 'https://i.pinimg.com/736x/fe/97/bf/fe97bff9757f1d3a62b2c6f85d5518ba.jpg', 200, 200, '2023-11-20 18:20:00', '2023-11-20 18:20:00'),
(3, 'Hello Kitty', 'fresas, arte, pixelart, helloKitty, ilustración', 'https://i.pinimg.com/736x/5a/34/dd/5a34dd2af2b588a918606a6941d1525a.jpg', NULL, NULL, '2024-03-05 12:00:00', '2024-03-05 12:00:00'), 
(5, 'The good place', 'serie, netflix, theGoodPlace', 'https://i.pinimg.com/736x/22/ca/c2/22cac2fa2af7873518718e994332f6a6.jpg', NULL, NULL, '2023-05-14 20:00:00', '2023-05-14 20:00:00'),
(6, 'Sailor Moon - <3', 'divertido, gracioso, arte, ilustracion, sailorMoon', 'https://i.pinimg.com/1200x/50/db/f7/50dbf7f097185c603184962814a45127.jpg', NULL, NULL, '2024-04-01 08:30:00', '2024-04-01 08:30:00'),
(7, 'El viaje de Chihiro', 'elViajeDeChihiro, ilustracion, gibli, estudioGibli', 'https://i.pinimg.com/1200x/92/26/06/92260615ea004e9a5521b5cb4e8e530a.jpg', NULL, NULL, '2023-08-12 14:15:00', '2023-08-12 14:15:00'),
(8, 'Black Stones - NANA', 'fanArt, Nana, BlackStones, anime', 'https://i.pinimg.com/736x/fe/04/13/fe04133ff995562c49dde4e8af03ba56.jpg', NULL, NULL, '2024-01-20 22:10:00', '2024-01-20 22:10:00'),
(9, 'Mis tazas de ceramica favoritas', 'payaso, taza, colore, ceramica, única', 'https://i.pinimg.com/736x/11/49/f3/1149f3c35942b2d821de3e56d066b4b6.jpg', NULL, NULL, '2024-02-28 11:00:00', '2024-02-28 11:00:00'),
(10, 'Diseño de uñas', 'uñas, colore, rojo, rosa, azul, celeste, manos', 'https://i.pinimg.com/736x/47/4d/7d/474d7d94ad76fe61c0b227614efb3507.jpg', NULL, NULL, '2024-03-15 16:20:00', '2024-03-15 16:20:00'),
(11, 'Sailor Moon - fondo de pantalla', 'sailorMoon, fondoDePantalla, colores, dibujo, ilustracionDigital', 'https://i.pinimg.com/736x/22/fa/b5/22fab5d1f3cc9534c5e5234258c7f0f5.jpg', NULL, NULL, '2023-12-01 09:00:00', '2023-12-01 09:00:00'),
(12, 'Papá de Ponio - Ponyo', 'estudioGIbli, ponyo, sirenita, Gibli', 'https://i.pinimg.com/736x/fd/82/2f/fd822f26268946b6f10e20069384a817.jpg', 200, 200, '2024-01-05 13:40:00', '2024-01-05 13:40:00'),
(13, 'fondo de pantalla de peliculas del estudio Gibli', 'Gibli, fondoDePantalla, pelicula, peliculas, fondoDeTelefono', 'https://i.pinimg.com/1200x/a4/5d/bc/a45dbccdaaf1d2c3359403ab1ee8337e.jpg', NULL, NULL, '2023-07-22 19:30:00', '2023-07-22 19:30:00'),
(2, 'Jinx y Asha - Arcane', 'arcane, jinx, asha, ojos, ilustracion, serie, leagueOfLegends', 'https://i.pinimg.com/736x/9f/db/59/9fdb59521f2175a11452fe6498bad9dc.jpg', NULL, NULL, '2024-03-10 21:00:00', '2024-03-10 21:00:00'),
(4, 'El Gato con Botas', 'gatoConBotas, dreamworks, ilustracion, gato, aventuras', 'https://i.pinimg.com/1200x/75/e9/6e/75e96ec3b4372a0e85a9803a92841580.jpg', NULL, NULL, '2023-10-30 11:15:00', '2023-10-30 11:15:00'),
(2, 'Powder y Echo - Arcane', 'arcane, powder, echo, hermanas, emocion, serie, animacion', 'https://i.pinimg.com/736x/67/62/83/676283e183e71b1915b55d2d9fbb4c74.jpg', NULL, NULL, '2024-03-12 14:00:00', '2024-03-12 14:00:00'),
(14, 'Sakura en Kimono', 'sakura, cardCaptor, kimono, anime, clasico, nostalgia', 'https://i.pinimg.com/736x/c9/79/75/c979753034977da8b1e2ee82bef8283f.jpg', 490, 310, '2024-02-14 10:00:00', '2024-02-14 10:00:00'),
(14, 'Epic - Ithaca saga', 'EPIC, Odiseo, Penelope, músical, albúm', 'https://i.pinimg.com/736x/6b/88/98/6b88981769d71a0136ef0ac6e4a63766.jpg', 230, 180, '2024-03-20 17:45:00', '2024-03-21 11:20:00'),
(11, 'Grullas de Origami', 'origami, grullas, papel, decoracion, manualidades, japones', 'https://i.pinimg.com/1200x/66/43/05/6643054f89096bd507f9a5fc5399bda5.jpg', 340, 260, '2023-09-05 16:00:00', '2023-09-05 16:00:00'),
(1, 'Estrellas Decorativas', 'estrellas, decoracion, habitacion, luces, magico, noche', 'https://i.pinimg.com/736x/86/ab/8c/86ab8c22880c93e4bf5f638f08b3fc78.jpg', 290, 220, '2024-04-10 23:00:00', '2024-04-10 23:00:00'),
(1, 'Pantalón Jean Café', 'moda, pantalon, jean, cafe, outfit, estilo, casual', 'https://i.pinimg.com/1200x/64/71/eb/6471eb6eac6e332adfb40c5babf1e6f1.jpg', 180, 150, '2024-03-01 12:00:00', '2024-03-01 12:00:00'),
(12, 'Ꜥ× ೖ - ᗩᖇTISTS: [ Icon X-(@zipcy88) ]', 'ilustracion, colores, arteDigital', 'https://i.pinimg.com/736x/f8/23/65/f823658b0ab93c1eab100888d2a2d8f2.jpg', NULL, NULL, '2023-11-11 11:11:00', '2023-11-11 11:11:00'),
(3, 'Perfect Blue', 'pelicula, anime, perfectBlue, drama, fantasia', 'https://i.pinimg.com/736x/21/3b/53/213b535fe2f7959208fa4e04f0dddbbd.jpg', 370, 240, '2024-02-05 09:30:00', '2024-02-05 09:30:00'),
(7, 'Gato Azul K-pop', 'kpop, demonsHunters, gato, azul, anime, musica, coreano', 'https://i.pinimg.com/736x/e0/e2/38/e0e2382a8f03a359c4e2e4bd2256667b.jpg', NULL, NULL, '2024-04-15 18:00:00', '2024-04-15 18:00:00'),
(8, 'Wallpaper captura', 'wallpaper, captura, anime', 'https://i.pinimg.com/736x/5e/2f/b8/5e2fb88c3c7da194c43183f7d216f8f7.jpg', NULL, NULL, '2024-01-12 10:00:00', '2024-01-12 10:00:00'),
(4, 'Hora de aventura - Marceline', 'Marceline, horaDeAventura, fanArt, dibujo', 'https://i.pinimg.com/736x/a7/1c/0d/a71c0d96f4a498a23f27dbc673496d4c.jpg', NULL, NULL, '2023-12-24 20:00:00', '2023-12-25 10:00:00'),
(10, 'Stardew Valley', 'stardewValley, captura, mods', 'https://i.pinimg.com/1200x/8b/8f/1a/8b8f1a06bc2f37b5e5847263820c6415.jpg', NULL, NULL, '2024-03-30 14:00:00', '2024-03-30 14:00:00'),
(14, 'Uzumaki', 'junjiIto, uzumaki, manga, horrorCosmico, espirales', 'https://i.pinimg.com/736x/01/ed/13/01ed130ab6db007810c3ca8f0a43068f.jpg', NULL, NULL, '2024-03-30 14:00:00', '2024-03-30 14:00:00'),
(5, 'Bingo y su dibujo', 'bluey, bingo, dibujo, auto, animacion', 'https://i.pinimg.com/1200x/b9/f0/11/b9f011093049bc0dc2218d7bf4a08529.jpg', NULL, NULL, '2024-04-20 10:00:00', '2024-04-20 10:00:00'),
(11, 'Fondo de estrellas', 'estrellas, cielo, nocturno, fondoDePantalla', 'https://i.pinimg.com/736x/24/11/5c/24115ccdb618808c7a6b6ef58167a102.jpg', NULL, NULL, '2024-04-21 22:30:00', '2024-04-21 22:30:00'),
(14, 'Tomie - Fanart', 'tomie, junjiIto, manga, horror, ilustracion', 'https://i.pinimg.com/1200x/d4/d6/38/d4d6381ffae0f1298326afc2ba501f32.jpg', NULL, NULL, '2024-04-22 15:00:00', '2024-04-22 15:00:00'),
(2, 'Batman y el Acertijo', 'batman, riddler, dc, comics, villano', 'https://i.pinimg.com/736x/c0/76/bc/c076bc9f5a8c841dcd3c192b17d8678d.jpg', NULL, NULL, '2024-04-23 11:15:00', '2024-04-23 11:15:00'),
(7, 'Marnie en el bosque', 'estudioGhibli, marnie, bosque, pelicula, naturaleza', 'https://i.pinimg.com/1200x/b9/ed/9c/b9ed9cfa14c7cd13018fd1323d822584.jpg', NULL, NULL, '2024-04-24 09:40:00', '2024-04-24 09:40:00'),
(12, 'Ponyo sobre el mar', 'ponyo, estudioGhibli, mar, oceano, fondoDePantalla', 'https://i.pinimg.com/736x/d3/cf/57/d3cf576caa9a6da25246a2175ac9ee11.jpg', NULL, NULL, '2024-04-25 14:20:00', '2024-04-25 14:20:00'),
(9, 'Snoopy lector', 'snoopy, lectura, libros, tierno, ilustracion', 'https://i.pinimg.com/736x/64/45/af/6445af29a61f7eacd4408ebc9a70b748.jpg', NULL, NULL, '2024-04-26 17:00:00', '2024-04-26 17:00:00'),
(7, 'Jiro leyendo - Se levanta el viento', 'estudioGhibli, lectura, pelicula, anime, libros', 'https://i.pinimg.com/736x/3d/a5/5c/3da55cf732598cdfa972c8d364154ab0.jpg', NULL, NULL, '2024-04-27 12:00:00', '2024-04-27 12:00:00'),
(13, 'Sophie cosiendo', 'elCastilloVagabundo, sophie, ghibli, costura, anime', 'https://i.pinimg.com/1200x/d9/9c/61/d99c61372c7a349c7c8e25bb25c044f3.jpg', NULL, NULL, '2024-04-28 10:30:00', '2024-04-28 10:30:00'),
(7, 'Sombras del mercado - Chihiro', 'elViajeDeChihiro, ghibli, fantasmas, mercado, arte', 'https://i.pinimg.com/1200x/0f/f0/1b/0ff01b83ccc2733c768282bdafe602ec.jpg', NULL, NULL, '2024-04-29 20:15:00', '2024-04-29 20:15:00'),
(4, 'BMO Vaquero', 'horaDeAventura, bmo, vaquero, guitarra, tierno', 'https://i.pinimg.com/736x/4d/21/c4/4d21c4a518dbb597cf2de0cd036b137f.jpg', NULL, NULL, '2024-04-30 08:00:00', '2024-04-30 08:00:00'),
(6, 'Greg y su rana', 'masAllaDelJardin, greg, rana, animacion, bosque', 'https://i.pinimg.com/1200x/24/fb/ad/24fbad47cb4b5bfcc0f949d0ef059440.jpg', NULL, NULL, '2024-05-01 13:00:00', '2024-05-01 13:00:00'),
(2, 'Isha - Arcane', 'arcane, isha, fanArt, serie, netflix', 'https://i.pinimg.com/736x/72/3f/2c/723f2c4922c08298a65fb073ab2f67e5.jpg', NULL, NULL, '2024-05-02 21:00:00', '2024-05-02 21:00:00'),
(2, 'Mural Japonés Arcane', 'arcane, mural, japon, arteUrbano, jinx', 'https://i.pinimg.com/736x/75/cb/43/75cb435ec7141b657f37965304038f8a.jpg', NULL, NULL, '2024-05-03 11:00:00', '2024-05-03 11:00:00'),
(1, 'Bodegón cotidiano', 'gato, converse, jugo, cotidiano, ilustracion', 'https://i.pinimg.com/736x/8a/51/08/8a5108bffdcbfc508907a513656f7d6f.jpg', NULL, NULL, '2024-05-04 16:45:00', '2024-05-04 16:45:00'),
(8, 'Trapnest - NANA', 'nana, trapnest, anime, banda, personajes', 'https://i.pinimg.com/1200x/61/5e/bd/615ebd50e06539bc3570b3c421711f9d.jpg', NULL, NULL, '2024-05-05 23:00:00', '2024-05-05 23:00:00'),
(11, 'Clara y el Cascanueces', 'ballet, cascanueces, navidad, baile, clasico', 'https://i.pinimg.com/736x/1e/52/0c/1e520cb8248a7ff9e50cf9743477f3b5.jpg', NULL, NULL, '2024-05-06 19:30:00', '2024-05-06 19:30:00'),
(11, 'Copo de Nieve - Ballet', 'cascanueces, ballet, nieve, danza, arte', 'https://i.pinimg.com/1200x/b9/2d/14/b92d14c1df681e0d736d3e1800a17612.jpg', NULL, NULL, '2024-05-07 20:00:00', '2024-05-07 20:00:00'),
(3, 'Sensatez y Sentimientos', 'libros, literatura, portada, clasico, janeAusten', 'https://i.pinimg.com/736x/27/4b/25/274b25afdad975ccf5f8da75c9351d16.jpg', NULL, NULL, '2024-05-08 10:00:00', '2024-05-08 10:00:00');

*/
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
/*
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
*/
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

CREATE TABLE suscripciones_a_usuarios (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    susciptor_id INT NOT NULL,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    FOREIGN KEY (susciptor_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
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
