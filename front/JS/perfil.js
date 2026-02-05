import { crearCard } from './componentes/card.js';
import { abrirCardModal } from './componentes/modal.js';
import {
    API_ICONOS_URL,
    API_IMAGENES_URL,
    API_LIKES_URL,
    API_PUBLICACIONES_URL,
    API_TABLEROS_URL,
    API_USUARIOS_URL
} from "./api.js";

let usuarioActual = null;


function listarHashtags(etiquetas) {
    if (!etiquetas) return '';
    return etiquetas.split(',').map(tag => `<span class="tablero-hashtag">#${tag.trim()}</span>`).join('');
}

async function verPublicacionesTablero(tablero, usuarioId) {
    const container = document.getElementById('tableros-container');
    const navPerfil = document.querySelector('.navigation-options');
    
    container.style.display = 'block';

    if (navPerfil) navPerfil.style.display = 'none';

    container.innerHTML = `
      <div class="tablero-detalle-header">
        <button id="btn-atras-tableros" class="btn-atras">
          <i class="fa-solid fa-arrow-left"></i> Volver a tableros
        </button>
        <h2>${tablero.titulo}</h2>
        <div class="tablero-hashtags-container">
          ${listarHashtags(tablero.etiquetas)}
        </div>
      </div>

      <div id="publicaciones-tablero-grid" class="publicaciones-container"></div>
    `;

    document.getElementById('btn-atras-tableros').onclick = () => {
        if (navPerfil) navPerfil.style.display = 'flex';
        container.style.display = 'grid';
        cargarTableros(usuarioId); 
    };

    const grid = document.getElementById('publicaciones-tablero-grid');
    try {
        const res = await fetch(`${API_TABLEROS_URL}/tablero/${tablero.id}/publicaciones`);
        const publicaciones = await res.json();

        if (publicaciones.length === 0) {
            grid.innerHTML = " <div class='no-content'><img src='./img/tablero-vacio.png' alt='sin contenido'> <p>Este tablero no tiene publicaciones aún.</p>";
            return;
        }

        publicaciones.forEach(p => {
  const card = crearCard(
    {
      ...p,
      usuario_nombre: p.usuario_nombre || usuarioActual?.nombre,
      usuario_icono: p.usuario_icono || usuarioActual?.icono
    },
    {
      onOpenModal: abrirCardModal,
      onGoToProfile: (id) => window.location.href = `perfil.html?id=${id}`,
      showActions: false
    }
  );

  grid.appendChild(card);
});

    } catch (error) {
        console.error("Error al cargar pins del tablero:", error);
    }
}

async function cargarTableros(usuarioId) {
  const container = document.getElementById('tableros-container');
  container.style.display = 'grid';
  const usuarioLogueado = obtenerUsuarioLogueado();
  
  if (!container) return;

  try {
    const res = await fetch(`${API_TABLEROS_URL}/usuario/${usuarioId}`);
    const tableros = await res.ok ? await res.json() : [];
    actualizarEstadistica('tableros', tableros.length);
    if (!tableros.length) {
    const SINTAB = './img/sinTableros.png';
    container.innerHTML = `
        <div class="no-content">
            <img src="${SINTAB}" alt="Sin contenido">
            <p>Este usuario aún no tiene ningún tablero</p>
        </div>`;
      return;
    }

    container.innerHTML = '';

    const esMiPerfil = usuarioLogueado && Number(usuarioLogueado.id) === Number(usuarioId);

    for (const tablero of tableros) {
      let publicaciones = [];
      try {
        const r = await fetch(`${API_TABLEROS_URL}/tablero/${tablero.id}/publicaciones`);
        publicaciones = r.ok ? await r.json() : [];
      } catch (e) { publicaciones = []; }

      const imagenes = publicaciones
        .filter(p => p.imagen)
        .slice(0, 3)
        .map(p => {
          if (p.imagen.startsWith("http")) return p.imagen;
          return `${API_IMAGENES_URL}/${p.imagen}`;
        });

      const div = document.createElement('div');
      div.className = 'tablero-item';

      div.innerHTML = `
        <div class="tablero-header">
          <span class="tablero-titulo">${tablero.titulo}</span>
          
          ${esMiPerfil ? `
          <div class="card-actions">
            <button class="card-action-btn edit" title="Editar">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="card-action-btn delete" title="Eliminar">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
          ` : ''}
        </div>

        <div class="tablero-info-secundaria">
          <span class="tablero-count">${tablero.cantidad_pins} pins</span>
        </div>

        <div class="tablero-preview ${imagenes.length ? '' : 'no-content'}">
          ${
            imagenes.length
              ? imagenes.map((img) => `
                  <div class="tablero-preview-slot">
                    <img class="tablero-preview-img" src="${img}" loading="lazy">
                  </div>
                `).join('')
              : `<p class="tablero-vacio">Tablero vacío</p>`
          }
        </div>
        <p class="tablero-etiquetas">${listarHashtags(tablero.etiquetas) || ''}</p>
      `;
          
      div.querySelector('.tablero-preview').onclick = () => {
        verPublicacionesTablero(tablero, usuarioId);
      };

     if (esMiPerfil) {
        const btnDelete = div.querySelector('.card-action-btn.delete');
        const btnEdit = div.querySelector('.card-action-btn.edit');

        btnDelete.addEventListener('click', async () => {
          if (!confirm(`¿Estás seguro de que quieres eliminar el tablero "${tablero.titulo}"?`)) return;
          
          try {
            const response = await fetch(`${API_TABLEROS_URL}/${tablero.id}`, { method: 'DELETE' });
            if (response.ok) {
              div.remove();
              alert("Tablero eliminado");
            } else {
              alert("Error al eliminar el tablero");
            }
          } catch (error) {
            console.error(error);
          }
        });

        btnEdit.addEventListener('click', async () => {
          const nuevoTitulo = prompt("Nuevo nombre del tablero:", tablero.titulo);
          const nuevasEtiquetas = prompt("Nuevas etiquetas (separadas por coma):", tablero.etiquetas || "");

          if (nuevoTitulo === null) return; 

          try {
            const response = await fetch(`${API_TABLEROS_URL}/${tablero.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                titulo: nuevoTitulo, 
                etiquetas: nuevasEtiquetas 
              })
            });

            if (response.ok) {
              const actualizado = await response.json();
              div.querySelector('.tablero-titulo').textContent = actualizado.titulo;
              div.querySelector('.tablero-etiquetas').innerHTML = listarHashtags(actualizado.etiquetas);
              alert("Tablero actualizado");
            }
          } catch (error) {
            console.error("Error al editar:", error);
          }
        });
      }

      container.appendChild(div);
  
    }
    
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>Error cargando tableros</p>`;
  }
}


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
  return `${icono}`;
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
function actualizarEstadistica(tipo, cantidad) {
    const el = document.getElementById(`estadistica-${tipo}`);
    if (el) {
        el.textContent = Math.max(0, cantidad);
    }
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
                    if (usuarioId) {
                      cargarTableros(usuarioId);
                    }

                    break;
                    
                case 'Búsquedas personalizadas':
                    document.querySelector('.searches-content').style.display = 'block';
                    break;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarPerfilUsuario();
    configurarNavegacion();

    setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');

        if (tab === 'busquedas') {
            const opciones = document.querySelectorAll('.nav-option');
            opciones.forEach(option => {
                if (option.textContent.trim().toLowerCase() === 'búsquedas personalizadas') {
                    option.click();
                }
            });
        }
        if (tab === 'tableros') {
            const opciones = document.querySelectorAll('.nav-option');
            opciones.forEach(option => {
                if (option.textContent.trim().toLowerCase() === 'tableros') {
                    option.click();
                }
            });
        }
    }, 50); 
});

async function cargarPerfilUsuario() {
  const usuarioId = obtenerUsuarioId();
  if (!usuarioId) return;

  try {
    const response = await fetch(`${API_USUARIOS_URL}/${usuarioId}`);
    if (!response.ok) throw new Error('Usuario no encontrado');

    const json = await response.json();
    const usuario = json;
    usuarioActual = usuario;

    mostrarDatosUsuario(usuario);
    cargarPublicacionesDeUsuario(usuario.id);
    const resTab = await fetch(`${API_TABLEROS_URL}/usuario/${usuarioId}`);
    if (resTab.ok) {
        const tableros = await resTab.json();
        actualizarEstadistica('tableros', tableros.length);
    }
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

// funcion para contar el total de likes de todas las publicaciones de un usuario
async function cargarLikesTotalesUsuario(publicaciones) {
    if (!Array.isArray(publicaciones) || publicaciones.length === 0) {
        actualizarEstadistica('likes', 0);
        return;
    }

    try {
        let totalLikes = 0;

        await Promise.all(
            publicaciones.map(async (pub) => {
                const res = await fetch(`${API_LIKES_URL}/publicacion/${pub.id}`);
                if (!res.ok) return;

                const likes = await res.json();
                totalLikes += likes.length;
            })
        );

        actualizarEstadistica('likes', totalLikes);

    } catch (error) {
        console.error("Error calculando likes:", error);
        actualizarEstadistica('likes', 0);
    }
}


function verificarCantPublicaciones(container) {
    if (!container || container.children.length > 0) return;

    const SINPUBLIC = './img/sinPublicaciones.png';
    container.innerHTML = `
        <div class="no-content">
            <img src="${SINPUBLIC}" alt="Sin contenido">
            <p>Este usuario aún no tiene publicaciones</p>
        </div>`;
}
async function cargarPublicacionesDeUsuario(usuarioId) {
  const container = document.getElementById('publicaciones-container');
  const SINPUBLIC = './img/sinPublicaciones.png';
  if (!container) return;

  try {
    const response = await fetch(`${API_PUBLICACIONES_URL}/usuario/${usuarioId}`);
    if (!response.ok) throw new Error('Error al obtener publicaciones');

    const publicaciones = await response.json();
    actualizarEstadistica('publicaciones', publicaciones ? publicaciones.length : 0); 
    await cargarLikesTotalesUsuario(publicaciones);

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
  const card = crearCard(
    {
      ...p,
      usuario_nombre: usuarioActual.nombre,
      usuario_icono: usuarioActual.icono
    },

    {
      onOpenModal: abrirCardModal, 
      onGoToProfile: (id) => {
          window.location.href = `perfil.html?id=${id}`;
      },
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
            `${API_PUBLICACIONES_URL}/${publicacion.id}`,
            { method: 'DELETE' }
          );

          if (!response.ok) {
            const err = await response.json();
            alert(err.error || "Error al eliminar la publicación");
            return;
          }
          card.remove();
          alert("Publicación eliminada con éxito");
          const span = document.getElementById('estadistica-publicaciones');
          const nuevoValor = (parseInt(span?.textContent) || 1) - 1;
          actualizarEstadistica('publicaciones', nuevoValor);
          verificarCantPublicaciones(container);
        } catch (error) {
          console.error(error);
          alert("Error de conexión con el servidor");
        }
      },
      showActions: true
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
            `${API_USUARIOS_URL}/${user.id}`,
            { method: 'DELETE' }
        );

        if (response.ok) {
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
      `${API_USUARIOS_URL}/${usuarioLogueado.id}`,
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
