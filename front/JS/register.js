document.getElementById("form-registro").addEventListener("submit", async (e) =>{
    e.preventDefault();

    const mensajes_error_aviso = document.getElementById("mensaje-error-aviso");
    mensajes_error_aviso.innerHTML = "";
    mensajes_error_aviso.style.color = "red";
    
    const datos = {
        nombre: e.target.usuario.value,
        contrasenia: e.target.contrasena.value,
        repetir_contrasenia: e.target.repetir_contrasena.value,
        email: e.target.email.value,
        fecha_nacimiento: e.target.fecha.value
    };
    
    try {
        const respuesta = await fetch("http://localhost:3000/usuarios/", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            if (resultado.errors && Array.isArray(resultado.errors)) {
                mensajes_error_aviso.textContent = resultado.errors[0].message;
                return;
            }

            if (resultado.error) {
                mensajes_error_aviso.textContent = resultado.error;
                return;
            }

            mensajes_error_aviso.textContent = "Error al registrar usuario";
            console.log("respuesta del backend:",resultado);
            return;
        }

        mensajes_error_aviso.style.color = "green";
        mensajes_error_aviso.textContent = "Registro enviado exitosamente";
        console.log("respuesta del backend:",resultado);
        irAlPerfil(resultado.id);
        
    } catch (error) {
        console.error("error al enviar datos:",error);
        alert("Ocurrió un error al enviar los datos");
    }
});