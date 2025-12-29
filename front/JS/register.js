const API_BASE = "http://127.0.0.1:3000";
const API_USUARIOS = API_BASE + "/usuarios";

const formRegistro = document.getElementById("form-registro");
const mensajeError = document.getElementById("mensaje-error-aviso");

formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeError.textContent = "";

    const usuario = formRegistro.usuario.value.trim();
    const email = formRegistro.email.value.trim();
    const contrasena = formRegistro.contrasena.value;
    const repetir = formRegistro.repetir_contrasena.value;
    const fecha = formRegistro.fecha.value;
    const icono = formRegistro.icono.files[0];

    if (!usuario || !email || !contrasena || !repetir || !fecha) {
        mensajeError.textContent = "Todos los campos son obligatorios.";
        return;
    }
    if (contrasena !== repetir) { 
        mensajeError.textContent = "Las contraseñas no coinciden."; 
        return; 
    }
    if (usuario.length < 6) {    
        mensajeError.textContent = "El nombre debe tener al menos 6 caracteres."; 
        return; 
    }
    if (contrasena.length < 6) {    
        mensajeError.textContent = "La contraseña debe tener al menos 6 caracteres."; 
        return; 
    }
    const formData = new FormData();
    formData.append("nombre", usuario);              
    formData.append("email", email);
    formData.append("contrasenia", contrasena);
    formData.append("fecha_nacimiento", fecha);
    
    if (icono) {
        formData.append("icono", icono);
    }

    try {
        const res = await fetch(API_USUARIOS, {
            method: "POST",
            body: formData
        });

        const data = await res.json();
        
        if (!res.ok) {
            let mensaje = "Error al registrar usuario.";
            
            if (res.status === 400 && data.error) {
                mensaje = `Error en la imagen: ${data.error}`;
            } else if (res.status === 400 && data.errors) {
                mensaje = "Datos inválidos: " + data.errors.map(err => err.message).join(', ');
            } else if (res.status === 409) {
                mensaje = data.error;
            } else if (res.status === 500 && data.error === "Error en la subida de archivo") {
                mensaje = "Error al subir la imagen.";
            }
            
            mensajeError.textContent = mensaje || data.error || data.mensaje || "Error del servidor.";
            return;
        }

        formRegistro.reset();
        alert("Usuario registrado correctamente");
        window.location.href = "login.html";

    } catch (err) {
        console.error(err);
        mensajeError.textContent = "No se pudo conectar con el servidor.";
    }
});