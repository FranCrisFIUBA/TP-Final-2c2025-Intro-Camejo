document.getElementById("form-registro").addEventListener("submit", async (e) =>{
    e.preventDefault();

    const mensajesError = document.getElementById("mensaje-error");
    mensajesError.innerHTML = "";
    mensajesError.style.color = "red";
    
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
                mensajesError.textContent = resultado.errors[0].message;
                return;
            }

            if (resultado.error) {
                mensajesError.textContent = resultado.error;
                return;
            }

            mensajesError.textContent = "Error al registrar usuario";
            return;
        }

        console.log("respuesta del backend:",resultado);

        alert("Registro enviado exitosamente");
    } catch (error) {
        console.error("error al enviar datos:",error);
        alert("Ocurrió un error al enviar los datos");
    }
});