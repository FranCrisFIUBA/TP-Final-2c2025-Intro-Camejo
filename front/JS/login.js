document.getElementById("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();

    const datos = {
        usuario: e.target.usuario.value,
        contraseña: e.target.contraseña.value
    };

    try {
        const respuesta = await fetch("http://localhost:3000/usuario/", {
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