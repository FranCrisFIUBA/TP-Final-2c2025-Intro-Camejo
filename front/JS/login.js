document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const mensaje = document.getElementById("mensaje-login");
    mensaje.textContent = "";
    mensaje.style.color = "red";

    const datos = {
        usuario: e.target.usuario.value,
        contrasenia: e.target.contraseña.value 
    };

    if (!datos.usuario || !datos.contrasenia) {
        mensaje.textContent = "Debes completar todos los campos";
        return;
    }

    try {
        const respuesta = await fetch("http://localhost:3000/usuarios/");
        if (!respuesta.ok) {
            mensaje.textContent = "No se pudo obtener usuarios";
            return;
        }
        const resultado = await respuesta.json();
        const usuario_ingresado = resultado.find(u =>
            u.nombre === datos.usuario && u.contrasenia === datos.contrasenia
        );

        if (usuario_ingresado) {
            mensaje.style.color = "green";
            mensaje.textContent = "Login exitoso";
            console.log("Usuario logueado", usuario_ingresado);
            irAlPerfil(usuario_ingresado.id);
        } else {
            mensaje.style.color = "red";
            mensaje.textContent = "Usuario o contraseña incorrectos";
            return;
        }
    } catch (error) {
        console.log("error al enviar los datos",error);
        mensaje.textContent = "No se pudo conectar con el servidor";
    }
});