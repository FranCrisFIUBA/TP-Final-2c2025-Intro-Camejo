const API_BASE_URL = 'http://127.0.0.1:3000';
let usuarioActual = null;

/* ===========================
   UTILIDADES
=========================== */

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
  return `${API_BASE_URL}/iconos/${icono}`;
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

function listarHashtags(etiquetas) {
  if (!etiquetas) return '';
  return etiquetas
    .split(',')
    .map(tag => `<span class="hashtag">#${tag.trim()}</span>`)
    .join('');
}

/* ===========================
   PERFIL
=========================== */

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

/* ===========================
   ACCIONES DE PERFIL
=========================== */

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

/* ===========================
   PUBLICACIONES
=========================== */

async function cargarPublicacionesDeUsuario(usuarioId) {
  const container = document.getElementById('publicaciones-container');
  if (!container) return;

  try {
    const response = await fetch(`${API_BASE_URL}/publicaciones/usuario/${usuarioId}`);
    if (!response.ok) throw new Error('Error al obtener publicaciones');

    const publicaciones = await response.json();

    if (!publicaciones || publicaciones.length === 0) {
      container.innerHTML = `
        <div class="no-content">
          <p>Este usuario aún no tiene publicaciones</p>
        </div>`;
      return;
    }

    container.innerHTML = publicaciones.map(p => `
      <div class="publicacion-item">
        <h3>${p.titulo || 'Sin título'}</h3>
        <img src="${p.url_imagen || './img/placeholder.jpg'}" alt="">
        <div>${listarHashtags(p.etiquetas)}</div>
      </div>
    `).join('');

  } catch (error) {
    console.error(error);
    container.innerHTML = `<p>Error al cargar publicaciones</p>`;
  }
}

/* ===========================
   MODAL EDICIÓN
=========================== */

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
  const fecha = document.getElementById('edit-fecha');
  const img = document.getElementById('profile-image-edit');

  if (nombre) nombre.value = usuario.nombre || '';
  if (fecha && usuario.fecha_nacimiento) {
    fecha.value = usuario.fecha_nacimiento.split('T')[0];
  }

  if (img) {
    img.src = resolverIcono(usuario.icono);
    img.onerror = () => img.src = './img/avatar-default.jpg';
  }
}

/* ===========================
   EVENTOS
=========================== */

document.addEventListener('DOMContentLoaded', () => {
  cargarPerfilUsuario();
});

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
