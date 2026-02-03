document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const mensaje = document.getElementById("mensaje-login");
  mensaje.textContent = "";
  mensaje.style.color = "#ac2b2b";

  const datos = {
    usuario: e.target.usuario.value.trim(),
    contrasenia: e.target.contrasenia.value
  };


  if (!datos.usuario || !datos.contrasenia) {
    mensaje.textContent = "Debes completar todos los campos";
    return;
  }

  try {
    const respuesta = await fetch("http://localhost:3000/usuarios");
    
    if (!respuesta.ok) {
      mensaje.textContent = "No se pudo obtener usuarios";
      return;
    }

    const usuarios = await respuesta.json();

    const usuario_ingresado = usuarios.find(u => {
      return u.nombre === datos.usuario && u.contrasenia === datos.contrasenia;
    });

    if (!usuario_ingresado) {
      mensaje.textContent = "Usuario o contraseña incorrectos";
      return;
    }

    localStorage.setItem(
      "usuarioLogueado",
      JSON.stringify(usuario_ingresado)
    );

    mensaje.style.color = "green";
    mensaje.textContent = "Login exitoso";

    irAlPerfil(usuario_ingresado.id);

  } catch (error) {
    console.error("Error completo:", error);
    mensaje.textContent = "No se pudo conectar con el servidor";
  }
});

function irAlPerfil(usuarioId) {
  console.log("Redirigiendo a perfil con ID:", usuarioId);
  window.location.href = `perfil.html?id=${usuarioId}`;
}