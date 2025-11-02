
# Endpoints Usuarios

---

## POST /usuario/
Crea un nuevo usuario.
Vease [Base64](https://developer.mozilla.org/es/docs/Glossary/Base64)
### Request
``` json
{
    /*
    nombre del usuario
    debe contener entre 6 a 24 caracteres, los cuales pueden ser,
    alfanumericos (mayusculas y minusculas), '.', '-' y '_'
    */
    "nombre": "Pablito1234",
    
    /*
    debe contener entre 6 a 24 caracteres, entre los cuales debe haber, 
    al menos una mayuscula y al menos uno de los siguientes simbolos '.', '-' o '_',
    el resto pueden ser caracteres alfanumericos
    */
    "contrasenia": "123.PassWord",
    
    /*
    opcional
    datos de la imagen del icono formateados en base64
    */
    "icono": "j01j3dolsajdsa..." 
}
```

### Response

#### 201 - Created
El usuario fue creado satisfactoriamente
``` json
{
    /*
    id del nuevo usuario creado
    */
    "id": 123
}
```

#### 400 - Bad Request
Hubo un problema en la request

###### Ejemplo:
``` text
Largo del nombre de usuario invalido, debe contener entre 6 y 24 caracteres
```

#### 500 - Internal Server Error
Hubo un error interno en el servidor y no se pudo llevar a cabo la solicitud
``` text
Error interno del servidor
```

---

## PUT /usuario/:id
Edita un usuario

### Parámetros
- id: id del usuario

### Request
Los datos de la request deben cumplir con los mismos criterios que en [POST /usuario/](#post-usuario)
``` json
{
    /*
    opcional
    nuevo nombre de usuario
    */
    "nombre": "",
    
    /*
    opcional
    nueva contraseña del usuario
    */
    "contrasenia": "",
    
    /*
    opcional
    nuevo icono de usuario
    */
    "icon": "j01j3dolsajdsa..."
}
```

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

### Parámetros
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
    /*
    requerido
    cantidad de usuarios maximos en las que agrupar las paginas
    */
    "cantidad_por_pagina": 20,
    
    /*
    requerido
    numero de pagina que obtener
    */
    "numero_pagina": 3,
    
    /*
    opcional
    criterio de orden
    valor por defecto: "nombre"
    opciones:
        "publicaciones recientes"
        "fecha_registro"
        "nombre"
    */
    "ordenar_por": "fecha_registro", // opcional
    
    /*
    opcional
    indica si se requiere invertir o no el orden
    valor por defecto: false
    */
    "orden_invertido": true,
}
```

### Response

#### Ok - 200
Se ha encontrado y enviado con exito el usuario
``` json
{
    /*
    lista de usuarios en la pagina
    largo menor o igual a "cantidad_por_pagina"
    formato de cada usuario igual al de GET /usuario/:id
    */
    "usuarios": [],
    
    /*
    cantidad de paginas totales, con los valores de numero_pagina y cantidad_por_pagina actuales
    */
    "cantidad_de_paginas": 12,
    
    /* igual que en la request */
    "numero_pagina": 1,
    
    /* igual que en la request */
    "cantidad_por_pagina": 20
}
```

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

### Parámetros
- id: id del usuario

### Request
``` json
/* request vacia */
```

### Response

#### 200 - Ok
``` json
{
    /* nombre del usuario */
    "nombre": "Pablito1234",
    
    /* contraseña del usuario */
    "contrasenia": "123.PassWord"
    
    /* url de la imagen del icono de usuario */
    "icono": "url",
    
    /* timestamp de la fecha de nacimiento del usuario*/
    "fecha_nacimiento": 3107832103720,
    
    /* timestamp de la fecha de registro del usuario*/
    "fecha_registro": 131232141412321
}
```

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
