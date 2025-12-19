document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
        usuario: e.target.usuario.value,
        contrasenia: e.target.contraseña.value // enviar contrasenia, no contraseña
    };

    try {
        const respuesta = await fetch("http://localhost:3000/usuarios/", {
            method: "POST",
            headers: {
                "Content-Type" : "aplication/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        console.log("respuesta del backend:",resultado);

        if (resultado.ok) {
            alert("Login exitoso");
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    } catch (error) {
        console.log("error al enviar los datos",error);
        alert("No se pudo conectar con el servidor");
    }
});