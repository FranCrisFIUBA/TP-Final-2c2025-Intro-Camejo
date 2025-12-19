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
        const respuesta = await fetch("http://localhost:3000/usuarios/", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        console.log("respuesta del backend:",resultado);

        if (respuesta.ok) {
            mensaje.style.color = "green";
            mensaje.textContent = "Login exitoso";
        } else {
            mensaje.style.color = "red";
            mensaje.textContent = resultado.error || "Usuario o contraseña incorrectos";
            return;
        }
    } catch (error) {
        console.log("error al enviar los datos",error);
        mensaje.textContent = "No se pudo conectar con el servidor";
    }
});