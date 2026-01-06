const API_BASE_URL = 'http://127.0.0.1:3000';
let usuarioActual = null;

function obtenerUsuarioLogueado() {
  const data = localStorage.getItem("usuarioLogueado");
  return data ? JSON.parse(data) : null;
}

function obtenerUsuarioId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function validarAccionesPerfil() {
  const usuarioLogueado = obtenerUsuarioLogueado();
  const usuarioPerfilId = obtenerUsuarioId();
  const acciones = document.querySelector('.profile-actions');

  console.log('Validando acciones:', {
    usuarioLogueado,
    usuarioPerfilId,
    accionesExiste: !!acciones
  });

  if (!acciones) return;

  acciones.classList.remove('visible');

  if (!usuarioLogueado || !usuarioPerfilId) return;

  if (Number(usuarioLogueado.id) === Number(usuarioPerfilId)) {
    acciones.classList.add('visible');
  }
}


function formatearFecha(fechaString) {
  try {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '2024';
  }
}

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

    const usuario = await response.json();
    usuarioActual = usuario;

    mostrarDatosUsuario(usuario);
    cargarPublicacionesDeUsuario(usuarioId);

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
    profileImage.src = usuario.icono || './img/avatar-default.jpg';
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

async function cargarPublicacionesDeUsuario(usuarioId) {
    const publicacionesContainer = document.getElementById('publicaciones-container');
    if (!publicacionesContainer) return;

    try {
        console.log(`Intentando cargar publicaciones para el ID: ${usuarioId}`);
        const response = await fetch(`${API_BASE_URL}/publicaciones/usuario/${usuarioId}`);
        
        if (!response.ok) {
            const errorTexto = await response.text(); 
            throw new Error(`Error ${response.status}: ${errorTexto}`);
        }
        
        const publicaciones = await response.json();
        console.log("Publicaciones recibidas:", publicaciones);

        // 1. Manejo de caso sin publicaciones
        if (!publicaciones || publicaciones.length === 0) {
            publicacionesContainer.innerHTML = `
                <div class="no-content">
                    <i class="fa-solid fa-images" style="font-size: 48px; margin-bottom: 20px; color: #ccc;"></i>
                    <p>Este usuario aún no tiene publicaciones</p>
                </div>
            `;
            return;
        }

        // 2. Renderizado de las cards
        const html = publicaciones.map(p => {
            // Convertimos el objeto a string para pasarlo al modal de forma segura
            const publicacionJSON = JSON.stringify(p).replace(/'/g, "&apos;");

            return `
            <div class="publicacion-item" data-publicacion-id="${p.id}">
                <div class="publicacion-header">
                    <h3 class="publicacion-title">${p.titulo || 'Sin título'}</h3>
                    <span class="publicacion-likes">
                        <i class="fas fa-heart"></i> ${p.likes || 0}
                    </span>
                </div>
                <div class="publicacion-preview">
                    <img src="${p.url_imagen || './img/placeholder.jpg'}" 
                         alt="${p.titulo}" 
                         class="publicacion-image" "
                         onclick='abrirCardModal(${publicacionJSON})'>
                </div>
                <div class="publicacion-info">
                    <div class="publicacion-hashtags">
                        ${listarHashtags(p.etiquetas)}
                    </div>
                    <p class="publicacion-fecha">
                        <i class="fa-regular fa-calendar"></i> ${calcularFecha(p.fecha_publicacion)}
                    </p>
                </div>
            </div>
            `;
        }).join('');

        publicacionesContainer.innerHTML = html;

    } catch (error) {
        console.error('Error detallado:', error);
        publicacionesContainer.innerHTML = `<p class="error-msg">Error: No se pudieron cargar las publicaciones.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', cargarPerfilUsuario);



function listarHashtags(etiquetas) {
    if (!etiquetas) return '';
    return etiquetas.split(',')
        .map(tag => `<span class="hashtag">#${tag.trim()}</span>`)
        .join('');
}

function calcularFecha(fechaInput) {
    const fechaPublicacion = new Date(fechaInput);
    const ahora = new Date();
    const diferenciaEnSegundos = Math.floor((ahora - fechaPublicacion) / 1000);

    // Definimos los intervalos en segundos
    const intervalos = {
        año: 31536000,
        mes: 2592000,
        día: 86400,
        hora: 3600,
        minuto: 60
    };

    let unidad = Math.floor(diferenciaEnSegundos / intervalos.año);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 año" : `hace ${unidad} años`;
    }
    unidad = Math.floor(diferenciaEnSegundos / intervalos.mes);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 mes" : `hace ${unidad} meses`;
    }
    unidad = Math.floor(diferenciaEnSegundos / intervalos.día);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 día" : `hace ${unidad} días`;
    }
    unidad = Math.floor(diferenciaEnSegundos / intervalos.hora);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 hora" : `hace ${unidad} horas`;
    }
    unidad = Math.floor(diferenciaEnSegundos / intervalos.minuto);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 minuto" : `hace ${unidad} minutos`;
    }

    return "hace un momento";
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

function abrirModalPerfil() {
  const modal = document.getElementById('modal-editar');
  if (!modal) return;
  modal.style.display = 'flex';
}

function cerrarModalPerfil() {
  const modal = document.getElementById('modal-editar');
  if (!modal) return;
  modal.style.display = 'none';
}

function completarFormularioPerfil(usuario) {
  if (!usuario) return;

  const nombre = document.getElementById('edit-nombre');
  const fecha = document.getElementById('edit-fecha');
  const img = document.getElementById('profile-image-edit');
  const pass1 = document.getElementById('edit-contraseña');
  const pass2 = document.getElementById('edit-contraseña-repetida');

  if (nombre) nombre.value = usuario.nombre || '';
  if (fecha && usuario.fecha_nacimiento) {
    fecha.value = usuario.fecha_nacimiento.split('T')[0];
  }

  if (img) {
    img.src = usuario.icono || './img/avatar-default.jpg';
    img.onerror = () => img.src = './img/avatar-default.jpg';
  }

  if (pass1) pass1.value = '';
  if (pass2) pass2.value = '';
}

document.addEventListener('click', (e) => {

  if (e.target.closest('.btn-edit')) {
    e.preventDefault();

    if (!usuarioActual) {
      console.warn('Usuario aún no cargado');
      return;
    }

    completarFormularioPerfil(usuarioActual);
    abrirModalPerfil();
  }

  if (e.target.closest('#cancel-edit')) {
    e.preventDefault();
    cerrarModalPerfil();
  }

});
document.addEventListener('click', (e) => {
  const btnLogout = e.target.closest('.btn-logout');
  if (!btnLogout) return;

  e.preventDefault();

  if (!confirm('¿Seguro que querés cerrar sesión?')) return;
  localStorage.removeItem('usuarioLogueado');
  window.location.href = 'index.html'; 
});


document.addEventListener('DOMContentLoaded', () => {
  cargarPerfilUsuario();
});
