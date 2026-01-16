import { crearCard } from './componentes/card.js';

const API_BASE_URL = 'http://127.0.0.1:3000';
const API_IMAGENES = API_BASE_URL + '/imagenes';
const API_ICONOS = API_BASE_URL + '/iconos';
let usuarioActual = null;

function obtenerUsuarioLogueado() {
  const data = localStorage.getItem("usuarioLogueado");
  return data ? JSON.parse(data) : null;
}

function obtenerUsuarioId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function resolverIcono(icono) {
  if (!icono) return './img/avatar-default.jpg';
  return `${API_ICONOS}/${icono}`;
}

function formatearFecha(fechaString) {
  const fecha = new Date(fechaString);
  if (isNaN(fecha.getTime())) return 'Fecha desconocida';

  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
function esPerfilDelUsuarioLogueado() {
  const usuarioLogueado = obtenerUsuarioLogueado();
  const usuarioPerfilId = obtenerUsuarioId();

  if (!usuarioLogueado || !usuarioPerfilId) return false;

  return Number(usuarioLogueado.id) === Number(usuarioPerfilId);
}


function configurarNavegacion() {
    const usuarioId = obtenerUsuarioId();
    
    document.querySelectorAll('.nav-option').forEach(option => {
        option.addEventListener('click', async function() { 
            document.querySelectorAll('.nav-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            document.querySelector('.publicaciones-content').style.display = 'none';
            document.querySelector('.tableros-content').style.display = 'none';
            document.querySelector('.searches-content').style.display = 'none';
            const opcionSeleccionada = this.textContent.trim();
            switch(opcionSeleccionada) {
                case 'Publicaciones': 
                    document.querySelector('.publicaciones-content').style.display = 'block';
                    if (usuarioId) {
                        await cargarPublicacionesDeUsuarioAPI(usuarioId);
                    }
                    break;
                    
                case 'Tableros':
                    document.querySelector('.tableros-content').style.display = 'block';
                    break;
                    
                case 'Búsquedas personalizadas':
                    document.querySelector('.searches-content').style.display = 'block';
                    break;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        cargarPerfilUsuario();
        configurarNavegacion();
    }, 100);
});

function listarHashtags(etiquetas) {
  if (!etiquetas) return '';
  return etiquetas
    .split(',')
    .map(tag => `<span class="hashtag">#${tag.trim()}</span>`)
    .join('');
}


async function cargarPerfilUsuario() {
  const usuarioId = obtenerUsuarioId();
  if (!usuarioId) return;

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`);
    if (!response.ok) throw new Error('Usuario no encontrado');

    const json = await response.json();

    if (!json.success || !json.data) {
      throw new Error('Respuesta inválida del servidor');
    }

    const usuario = json.data;
    usuarioActual = usuario;

    mostrarDatosUsuario(usuario);
    cargarPublicacionesDeUsuario(usuario.id);

    setTimeout(validarAccionesPerfil, 0);

  } catch (error) {
    console.error('Error al cargar perfil:', error);
  }
}

function mostrarDatosUsuario(usuario) {
  const profileImage = document.getElementById('profile-image');
  const profileName = document.getElementById('profile-name');
  const profileDate = document.getElementById('profile-date');

  if (profileImage) {
    profileImage.src = resolverIcono(usuario.icono);
    profileImage.onerror = () => {
      profileImage.src = './img/avatar-default.jpg';
    };
  }

  if (profileName) {
    profileName.textContent = usuario.nombre;
  }

  if (profileDate) {
    profileDate.textContent = usuario.fecha_registro
      ? `Miembro desde ${formatearFecha(usuario.fecha_registro)}`
      : 'Miembro desde 2024';
  }
}

function validarAccionesPerfil() {
  const usuarioLogueado = obtenerUsuarioLogueado();
  const usuarioPerfilId = obtenerUsuarioId();
  const acciones = document.querySelector('.profile-actions');

  if (!acciones) return;

  acciones.classList.remove('visible');

  if (!usuarioLogueado || !usuarioPerfilId) return;

  if (Number(usuarioLogueado.id) === Number(usuarioPerfilId)) {
    acciones.classList.add('visible');
  }
}


async function cargarPublicacionesDeUsuario(usuarioId) {
  const container = document.getElementById('publicaciones-container');
  const SINPUBLIC = './img/sinPublicaciones1.png';
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/publicaciones/usuario/${usuarioId}`);
    if (!response.ok) throw new Error('Error al obtener publicaciones');

    const publicaciones = await response.json();

    if (!publicaciones || publicaciones.length === 0) {
      container.innerHTML = `
        <div class="no-content">
          <img src='${SINPUBLIC}' alt="Sin contenido">
          <p>Este usuario aún no tiene publicaciones</p>
        </div>`;
      return;
    }

    container.innerHTML = '';

publicaciones.forEach(p => {
  const editable = esPerfilDelUsuarioLogueado();

  const card = crearCard(
    {
      ...p,
      usuario_nombre: usuarioActual.nombre,
      usuario_icono: usuarioActual.icono
    },
    {
      editable: true,

      onEdit: (publicacion) => {
          localStorage.setItem("pinParaEditar", JSON.stringify(publicacion));
          window.location.href = "create-pin.html";
      },

      onDelete: async (publicacion) => {
        const confirmar = confirm(
          "¿Estás seguro de que querés eliminar esta publicación? Esta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
          const response = await fetch(
            `${API_BASE_URL}/publicaciones/${publicacion.id}`,
            { method: 'DELETE' }
          );

          if (!response.ok) {
            const err = await response.json();
            alert(err.error || "Error al eliminar la publicación");
            return;
          }
          card.remove();
          if (!container.children.length) {
            container.innerHTML = `
              <div class="no-content">
                <img src="./img/sinPublicaciones1.png" alt="Sin contenido">
                <p>Este usuario aún no tiene publicaciones</p>
              </div>`;
          }

        } catch (error) {
          console.error(error);
          alert("Error de conexión con el servidor");
        }
      }
    }
  );

  container.appendChild(card);
});



  } catch (error) {
    console.error(error);
    container.innerHTML = `<p>Error al cargar publicaciones</p>`;
  }
}

function validarContrasenia(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

function validarNombre(nombre) {
  const regex = /^[A-Za-z0-9._-]{6,25}$/;
  return regex.test(nombre);
}


function abrirModalPerfil() {
  const modal = document.getElementById('modal-editar');
  if (modal) modal.style.display = 'flex';
}

function cerrarModalPerfil() {
  const modal = document.getElementById('modal-editar');
  if (modal) modal.style.display = 'none';
}

function completarFormularioPerfil(usuario) {
  if (!usuario) return;

  const nombre = document.getElementById('edit-nombre');
  const img = document.getElementById('profile-image-edit');

  if (nombre) nombre.value = usuario.nombre || '';

  if (img) {
    img.src = resolverIcono(usuario.icono);
    img.onerror = () => img.src = './img/avatar-default.jpg';
  }
}

document.addEventListener('click', (e) => {

  if (e.target.closest('.btn-edit')) {
    e.preventDefault();
    if (!usuarioActual) return;
    completarFormularioPerfil(usuarioActual);
    abrirModalPerfil();
  }

  if (e.target.closest('#cancel-edit')) {
    e.preventDefault();
    cerrarModalPerfil();
  }

  if (e.target.closest('.btn-logout')) {
    e.preventDefault();
    if (confirm('¿Seguro que querés cerrar sesión?')) {
      localStorage.removeItem('usuarioLogueado');
      window.location.href = 'index.html';
    }
  }

});

const btnBorrar = document.getElementById('borrar-edit');

btnBorrar.addEventListener('click', async () => {
    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    const user = obtenerUsuarioLogueado();

    if (!user || !user.id) {
        alert("No se pudo identificar al usuario logueado.");
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/usuarios/${user.id}`,
            { method: 'DELETE' }
        );

        if (response.ok) {
            // Limpia sesión local antes de redirigir
            localStorage.removeItem('usuario');
            localStorage.removeItem('token');

            alert("Cuenta eliminada con éxito.");
            window.location.href = '/login.html';
        } else {
            const errorData = await response.json();
            alert(errorData?.error || "Error al eliminar la cuenta.");
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("No se pudo conectar con el servidor.");
    }
});


const editForm = document.getElementById('edit-profile-form');

editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuarioLogueado = obtenerUsuarioLogueado();
  if (!usuarioLogueado || !usuarioLogueado.id) {
    alert('Usuario no identificado');
    return;
  }

  const nombre = document.getElementById('edit-nombre').value.trim();
  const pass = document.getElementById('edit-contraseña').value;
  const passRep = document.getElementById('edit-contraseña-repetida').value;
  const iconoInput = document.getElementById('edit-icono');

  if (pass || passRep) {
    if (pass !== passRep) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!validarContrasenia(pass)) {
      alert(
        'La contraseña debe tener al menos:\n' +
        '- 8 caracteres\n' +
        '- 1 letra mayúscula\n' +
        '- 1 letra minúscula\n' +
        '- 1 número'
      );
      return;
    }
  }


  const formData = new FormData();
  formData.append('id', Number(usuarioLogueado.id));


  if (nombre && nombre !== usuarioActual.nombre) {
    if (!validarNombre(nombre)) {
      alert(
        'El nombre de usuario debe:\n' +
        '- Tener entre 6 y 25 caracteres\n' +
        '- Usar solo letras, números, . _ -\n' +
        '- No contener espacios ni tildes'
      );
      return;
    }

    formData.append('nombre', nombre);
  }

  if (pass) formData.append('contrasenia', pass);

  if (iconoInput?.files?.length > 0) { 
    formData.append('icono', iconoInput.files[0]);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/usuarios/${usuarioLogueado.id}`,
      {
        method: 'PATCH',
        body: formData
      }
    );

    if (!response.ok) {
      const error = await response.json();
      alert(error.error || 'Error al actualizar perfil');
      return;
    }

    const usuarioActualizado = await response.json();
    usuarioActual = usuarioActualizado;
    localStorage.setItem(
      'usuarioLogueado',
      JSON.stringify(usuarioActualizado)
    );

    mostrarDatosUsuario(usuarioActualizado);
    cerrarModalPerfil();
    alert('Perfil actualizado correctamente');

  } catch (err) {
    console.error(err);
    alert('Error de conexión con el servidor');
  }
});


const btnEditarAvatar = document.getElementById('btn-editar-avatar');
const inputIcono = document.getElementById('edit-icono');
const previewImg = document.getElementById('profile-image-edit');

btnEditarAvatar.addEventListener('click', () => {
  inputIcono.click();
});

inputIcono.addEventListener('change', () => {
  const file = inputIcono.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
  };
  reader.readAsDataURL(file);
});
