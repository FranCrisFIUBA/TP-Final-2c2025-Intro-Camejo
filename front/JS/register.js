document.getElementById("form-registro").addEventListener("submit", async (e) =>{
    e.preventDefault();
    const datos = {
        usario: e.target.usuario.value,
        email: e.target.email.value,
        contraseña: e.target.contraseña.value,
        repetir_contraseña: e.target.repetir_contraseña.value
    };

    if (datos.contraseña !== datos.repetir_contraseña) {
        alert("las contraseñas no coinciden");
        return;
    }
    
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

        alert("Registro enviado exitosamente");
    } catch (error) {
        console.error("error al enviar datos:",error);
        alert("Ocurrió un error al enviar los datos");
    }
});