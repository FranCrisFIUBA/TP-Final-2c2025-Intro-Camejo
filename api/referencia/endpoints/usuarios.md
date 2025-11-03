
# Endpoints Usuarios

---

## POST /usuario/
Crea un nuevo usuario.

### Request
``` json
{
    "nombre": "Pablito1234",
    "contrasenia": "123.PassWord",
    "icono": "j01j3dolsajdsa..." 
}
```

##### Campos
- ***nombre***:
nombre del usuario, 
debe contener entre 6 a 24 caracteres, los cuales pueden ser, 
alfanumericos (mayusculas y minusculas), '.', '-' y '_'
- ***contrasenia***:
debe contener entre 6 a 24 caracteres, entre los cuales debe haber, 
al menos una mayuscula y al menos uno de los siguientes simbolos '.', '-' o '_',
el resto pueden ser caracteres alfanumericos
- ***icono***:
opcional, 
datos de la imagen del icono formateados en [Base64](https://developer.mozilla.org/es/docs/Glossary/Base64)

### Response

#### 201 - Created
El usuario fue creado satisfactoriamente
``` json
{
    "id": 123
}
```

##### Campos
* ***id***:
id del nuevo usuario creado

---

#### 400 - Bad Request
Hubo un problema en la request

##### Ejemplo:
``` text
Largo del nombre de usuario invalido, debe contener entre 6 y 24 caracteres
```

#### 500 - Internal Server Error
Hubo un error interno en el servidor y no se pudo llevar a cabo la solicitud
``` text
Error interno del servidor
```

---

## PATCH /usuario/:id
Edita un usuario

##### Parámetros de la query
- id: id del usuario

### Request
Los datos de la request deben cumplir con los mismos criterios que en [POST /usuario/](#post-usuario)
``` json
{
    "nombre": "Jose.321",
    "contrasenia": "_contra123",
    "icon": "j01j3dolsajdsa..."
}
```

##### Campos

- ***nombre***:
opcional,
nuevo nombre de usuario
- ***contrasenia***:
opcional,
nueva contraseña del usuario
- ***icon***:
opcional,
nuevo icono de usuario

### Response

#### 200 - Ok
Los cambios han sido realizados satisfactoriamente
``` text
Ok
```

#### 404 - Not Found
No se pudo encontrar al usuario con id proveida
``` text
No se pudo encontrar al usuario con id 123
```

#### 500 - Internal Server Error
Hubo un error interno en el servidor y no se pudo llevar a cabo la solicitud
``` text
Error interno del servidor
```

---

## DELETE /usuario/:id
Remueve un usuario

##### Parámetros de la query
- id: id del usuario

### Request
``` json
/* request vacia */
```

### Response

#### 200 - Ok
El usuario se ha removido con exito
``` json
Ok
```

#### 500 - Internal Server Error
Hubo un error interno en el servidor y no se pudo llevar a cabo la solicitud
``` text
Error interno del servidor
```

---

## GET /usuarios/
Obtiene determinada cantidad de usuarios, 
pensado para ser usado en una lista de usuarios separada por paginas

### Request
``` json
{
    "cantidad_por_pagina": 20,
    "numero_pagina": 3,
    "ordenar_por": "fecha_registro",
    "orden_invertido": true,
}
```

##### Campos
- ***cantidad_por_pagina***:
requerido,
cantidad de usuarios maximos en las que agrupar las paginas
- ***numero_pagina***:
requerido,
numero de pagina que obtener
- ***ordenar_por***:
opcional,
criterio de orden, 
  - ***valor por defecto***: "nombre".
  - ***opciones***:
  "publicaciones recientes",
  "fecha_registro",
  "nombre"
- ***orden_invertido***:
opcional,
indica si se requiere invertir o no el orden,
valor por defecto: false.

### Response

#### Ok - 200
Se ha encontrado y enviado con exito el usuario
``` json
{
    "usuarios": [],
    "cantidad_de_paginas": 12,
    "numero_pagina": 1,
    "cantidad_por_pagina": 20
}
```

##### Campos
- ***usuarios***:
lista de usuarios en la pagina,
largo menor o igual a "cantidad_por_pagina"
formato de cada usuario igual al de GET /usuario/:id
- ***cantidad_de_paginas***:
cantidad de paginas totales (con numero_pagina y cantidad_por_pagina actuales)
- ***numero_pagina***: igual que en la request
- ***cantidad_por_pagina***: igual que en la request

#### 400 - Bad Request
Hubo un problema en la request

###### Ejemplo:
``` text
Numero de pagina invalido
```

###### Ejemplo:
``` text
Cantidad por pagina invalido
```

#### 500 - Internal Server Error
Hubo un error interno en el servidor y no se pudo llevar a cabo la solicitud
``` text
Error interno del servidor
```

---

## GET /usuario/:id
Obtiene un usuario

##### Parámetros de la query
- id: id del usuario

### Request
``` json
/* request vacia */
```

### Response

#### 200 - Ok
``` json
{
    "nombre": "Pablito1234",
    "contrasenia": "123.PassWord"
    "icono": "url",
    "fecha_nacimiento": 3107832103720,
    "fecha_registro": 131232141412321
}
```

##### Campos
* nombre: nombre del usuario
* contrasenia: contraseña del usuario
* icono: url de la imagen del icono de usuario
* fecha_nacimiento: timestamp de la fecha de nacimiento del usuario
* fecha_registro: timestamp de la fecha de registro del usuario

#### 404 - Not Found
No se pudo encontrar al usuario

###### Ejemplo:
``` text
No se pudo encontrar al usuario con id 123
```

#### 500 - Internal Server Error
Hubo un error interno en el servidor y no se pudo llevar a cabo la solicitud
``` text
Error interno del servidor
```
