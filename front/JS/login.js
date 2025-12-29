document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const mensaje = document.getElementById("mensaje-login");
  mensaje.textContent = "";
  mensaje.style.color = "red";

  const datos = {
    usuario: e.target.usuario.value.trim(),
    contrasenia: e.target.contrasenia.value
  };

  console.log("Datos ingresados:", datos); // <-- Añade esto

  if (!datos.usuario || !datos.contrasenia) {
    mensaje.textContent = "Debes completar todos los campos";
    return;
  }

  try {
    const respuesta = await fetch("http://localhost:3000/usuarios");
    console.log("Respuesta del servidor:", respuesta.status); // <-- Añade esto
    
    if (!respuesta.ok) {
      mensaje.textContent = "No se pudo obtener usuarios";
      return;
    }

    const usuarios = await respuesta.json();
    console.log("Usuarios recibidos:", usuarios); // <-- Añade esto

    const usuario_ingresado = usuarios.find(u => {
      console.log(`Comparando: ${u.nombre} === ${datos.usuario} && ${u.contrasenia} === ${datos.contrasenia}`); // <-- Añade esto
      return u.nombre === datos.usuario && u.contrasenia === datos.contrasenia;
    });

    console.log("Usuario encontrado:", usuario_ingresado); // <-- Añade esto

    if (!usuario_ingresado) {
      mensaje.textContent = "Usuario o contraseña incorrectos";
      return;
    }

    localStorage.setItem(
      "usuarioLogueado",
      JSON.stringify(usuario_ingresado)
    );

    console.log("LocalStorage guardado:", localStorage.getItem("usuarioLogueado")); // <-- Añade esto

    mensaje.style.color = "green";
    mensaje.textContent = "Login exitoso";

    // Asegúrate de que esta función existe
    irAlPerfil(usuario_ingresado.id);

  } catch (error) {
    console.error("Error completo:", error); // <-- Mejor logging
    mensaje.textContent = "No se pudo conectar con el servidor";
  }
});

// Asegúrate de que esta función está definida
function irAlPerfil(usuarioId) {
  console.log("Redirigiendo a perfil con ID:", usuarioId); // <-- Añade esto
  window.location.href = `perfil.html?id=${usuarioId}`;
}