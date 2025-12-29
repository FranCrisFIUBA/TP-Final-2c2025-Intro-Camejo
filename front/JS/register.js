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

    // ------------------ VALIDACIONES BÁSICAS ------------------
    if (!usuario || !email || !contrasena || !repetir || !fecha) {
        mensajeError.textContent = "Todos los campos son obligatorios.";
        return;
    }

    // El icono no es obligatorio según tu SQL (icono VARCHAR puede ser NULL)
    // Pero tu HTML tiene required en el input file, así que lo dejamos como obligatorio
    
    if (contrasena !== repetir) {
        mensajeError.textContent = "Las contraseñas no coinciden.";
        return;
    }

    if (contrasena.length < 6) {
        mensajeError.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
    }

    // ------------------ FORM DATA ------------------
    const formData = new FormData();
    formData.append("nombre", usuario);              
    formData.append("email", email);
    formData.append("contrasenia", contrasena);
    formData.append("fecha_nacimiento", fecha);
    
    // Solo añadir icono si existe (aunque tu HTML tiene required)
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
            // Manejo específico para el primer código backend
            let mensaje = "Error al registrar usuario.";
            
            if (res.status === 400 && data.error) {
                // Error de Multer (ej: "File too large", "Unexpected field")
                mensaje = `Error en la imagen: ${data.error}`;
            } else if (res.status === 400 && data.errors) {
                // Errores de validación de Zod (errors en plural)
                mensaje = "Datos inválidos: " + data.errors.map(err => err.message).join(', ');
            } else if (res.status === 409) {
                // Conflictos: usuario o email ya existe
                mensaje = data.error;
            } else if (res.status === 500 && data.error === "Error en la subida de archivo") {
                mensaje = "Error al subir la imagen.";
            }
            
            mensajeError.textContent = mensaje || data.error || data.mensaje || "Error del servidor.";
            return;
        }

        // Registro exitoso
        formRegistro.reset();
        alert("Usuario registrado correctamente");
        window.location.href = "login.html";

    } catch (err) {
        console.error(err);
        mensajeError.textContent = "No se pudo conectar con el servidor.";
    }
});