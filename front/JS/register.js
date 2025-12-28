document.getElementById("form-login").addEventListener("submit", async (e) => {
  e.preventDefault();

  const mensaje = document.getElementById("mensaje-login");
  mensaje.textContent = "";
  mensaje.style.color = "red";

  const datos = {
    usuario: e.target.usuario.value.trim(),
    contrasenia: e.target.contraseña.value.trim()
  };

  if (!datos.usuario || !datos.contrasenia) {
    mensaje.textContent = "Debes completar todos los campos";
    return;
  }

  try {
    const respuesta = await fetch("http://localhost:3000/usuarios/");
    if (!respuesta.ok) {
      mensaje.textContent = "No se pudo obtener usuarios";
      return;
    }

    const usuarios = await respuesta.json();

    const usuario_ingresado = usuarios.find(u =>
      u.nombre === datos.usuario && u.contrasenia === datos.contrasenia
    );

    if (!usuario_ingresado) {
      mensaje.textContent = "Usuario o contraseña incorrectos";
      return;
    }

    const usuarioSesion = {
      id: usuario_ingresado.id,
      nombre: usuario_ingresado.nombre,
      icono: usuario_ingresado.icono
    };

    guardarSesion(usuarioSesion);

    mensaje.style.color = "green";
    mensaje.textContent = "Login exitoso";

    irAlPerfil(usuarioSesion.id);

  } catch (error) {
    console.error("Error al enviar los datos:", error);
    mensaje.textContent = "No se pudo conectar con el servidor";
  }
});
