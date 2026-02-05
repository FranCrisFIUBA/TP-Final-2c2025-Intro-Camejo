import {crearCard} from './componentes/card.js';
import {abrirCardModal} from './componentes/modal.js';
import {API_COMENTARIOS_URL, API_PUBLICACIONES_URL, API_USUARIOS_URL} from "./api.js";

const usuariosCache = new Map();

let filtrosActivos = {
    tag: null,
    autor: null,
    likesMin: null,
    likesMax: null,
    fechaMin: null,
    fechaMax: null
  };

  
async function obtenerUsuarioPorId(usuarioId) {
    if (usuariosCache.has(usuarioId)) {
        return usuariosCache.get(usuarioId);
    }

    try {
        const res = await fetch(`${API_USUARIOS_URL}/${usuarioId}`);
        if (!res.ok) throw new Error('Error obteniendo usuario');

        const usuario = await res.json();

        usuariosCache.set(usuarioId, usuario);
        return usuario;
    } catch (err) {
        console.error(`Error cargando usuario ${usuarioId}`, err);
        return null;
    }
}
const cargarPublicaciones = async () => {
    try {
        const respuesta = await fetch(`${API_PUBLICACIONES_URL}`);
        if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);

        const datos = await respuesta.json();
        const SINPUBLIC = './img/sinPublicaciones1.png';
        const contenedor = document.querySelector(".cards-container") || document.querySelector("#cards-container");

        if (!contenedor) {
            console.error("No se encontró el contenedor en el HTML");
            return;
        }

        contenedor.innerHTML = "";

        if (!datos || datos.length === 0) {
            contenedor.innerHTML = `
                <div class="no-content">
                    <img src='${SINPUBLIC}' alt="No hay contenido">
                    <p>Aún no se ha hecho ninguna publicación. ¡Sé el primero en compartir algo!</p>
                </div>`;
            return; 
        }

        for (const publicacion of datos) {
            const usuario = await obtenerUsuarioPorId(publicacion.usuario_id);
            publicacion.usuario_nombre = usuario?.nombre || 'Usuario';
            publicacion.usuario_icono  = usuario?.icono || null;

            const nuevaCard = crearCard(publicacion, {
                onOpenModal: abrirCardModal,
                onGoToProfile: irAlPerfil
            });

            contenedor.appendChild(nuevaCard);
        }

    } catch (error) {
        console.error('Hubo un error al conectar con la API:', error);
        const contenedor = document.querySelector(".cards-container");
        if (contenedor) {
            contenedor.innerHTML = `<p class="no-content">Error al cargar las publicaciones. Inténtalo más tarde.</p>`;
        }
    }
};


async function renderizarPublicacionesDesdeDatos(datos) {
    const SINPUBLIC = './img/sinPublicaciones1.png';
    const contenedor =
        document.querySelector(".cards-container") ||
        document.querySelector("#cards-container");

    contenedor.innerHTML = "";

    if (!datos || datos.length === 0) {
        contenedor.innerHTML = `
            <div class="no-content">
                <img src='${SINPUBLIC}' alt="No hay contenido">
                <p>No se encontraron publicaciones con esa etiqueta.</p>
            </div>`;
        return;
    }

    for (const publicacion of datos) {
        const usuario = await obtenerUsuarioPorId(publicacion.usuario_id);

        publicacion.usuario_nombre = usuario?.nombre || 'Usuario';
        publicacion.usuario_icono  = usuario?.icono || null;

        const nuevaCard = crearCard(publicacion, {
            onOpenModal: abrirCardModal,
            onGoToProfile: irAlPerfil
        });

        contenedor.appendChild(nuevaCard);
    }
}


async function buscarPublicacionesPorTagConFiltros(filtros) {
    const params = new URLSearchParams();

    if (filtros.tag) {
        params.append("tag", filtros.tag);
      }
  
    if (filtros.autor) {
      params.append("autor", filtros.autor);
    }
  
    if (filtros.likesMin !== null) {
      params.append("likesMin", filtros.likesMin);
    }
  
    if (filtros.likesMax !== null) {
      params.append("likesMax", filtros.likesMax);
    }
  
    if (filtros.fechaMin) {
      params.append("fechaMin", filtros.fechaMin);
    }
  
    if (filtros.fechaMax) {
      params.append("fechaMax", filtros.fechaMax);
    }
  
    try {
      const respuesta = await fetch(
        `${API_PUBLICACIONES_URL}?${params.toString()}`
      );
  
      if (!respuesta.ok) {
        throw new Error("Error al aplicar filtros");
      }
  
      const datos = await respuesta.json();
      renderizarPublicacionesDesdeDatos(datos);
  
    } catch (error) {
      console.error("Error aplicando filtros:", error);
    }
  }




function irAlPerfil(usuarioId) {
    window.location.href = `perfil.html?id=${usuarioId}`;
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


async function borrarComentario(comentarioId) {
    const usuarioLogueado = obtenerUsuarioLogueado();

    try {
        const res = await fetch(`${API_COMENTARIOS_URL}/${comentarioId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: usuarioLogueado.id
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error);
        }

        return true;
    } catch (err) {
        console.error(err);
        alert(err.message);
        return false;
    }
}

async function editarComentario(comentarioId, contenido) {
    const usuarioLogueado = obtenerUsuarioLogueado();

    try {
        const res = await fetch(`${API_COMENTARIOS_URL}/${comentarioId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contenido,
                usuario_id: usuarioLogueado.id
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error);
        }

        return true;
    } catch (err) {
        console.error(err);
        alert(err.message);
        return false;
    }
}




function obtenerUsuarioLogueado() {
    const data = localStorage.getItem("usuarioLogueado");
    return data ? JSON.parse(data) : null;
}




async function enviarComentario(publicacionId, contenido, usuarioId) {
    try {
        const response = await fetch(`${API_COMENTARIOS_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario_id: usuarioId,
                publicacion_id: publicacionId,
                contenido: contenido
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al publicar");
        }

        return true;
    } catch (error) {
        console.error("Error en la petición POST:", error);
        alert("No se pudo publicar el comentario: " + error.message);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM LISTO");

    cargarPublicaciones();

    const panelFiltros = document.querySelector(".filters-panel");
    const inputAutor = panelFiltros.querySelector('input[name="autor"]');
    const inputLikesMin = panelFiltros.querySelector('input[name="likes_minimos"]');
    const inputLikesMax = panelFiltros.querySelector('input[name="likes_maximos"]');
    const inputFechaMin = panelFiltros.querySelector('input[name="fecha_publicacion_minima"]');
    const inputFechaMax = panelFiltros.querySelector('input[name="fecha_publicacion_maxima"]');

    const btnApply = panelFiltros.querySelector(".btn-apply");
    const btnClear = panelFiltros.querySelector(".btn-clear");

    const searchForm = document.querySelector(".search-bar");
    const searchInput = document.querySelector(".search-input");

    btnApply.addEventListener("click", () => {
        console.log("CLICK APLICAR");

        filtrosActivos.autor = inputAutor.value.trim() || null;
        filtrosActivos.likesMin = Number(inputLikesMin.value) || null;
        filtrosActivos.likesMax = Number(inputLikesMax.value) || null;
        filtrosActivos.fechaMin = inputFechaMin.value || null;
        filtrosActivos.fechaMax = inputFechaMax.value || null;

        panelFiltros.classList.remove("activo");
    });

    btnClear.addEventListener("click", () => {
        inputAutor.value = "";
        inputLikesMin.value = "";
        inputLikesMax.value = "";
        inputFechaMin.value = "";
        inputFechaMax.value = "";

        filtrosActivos = {
            tag: null,
            autor: null,
            likesMin: null,
            likesMax: null,
            fechaMin: null,
            fechaMax: null
        };
    });

    if (!searchForm || !searchInput) return;

    searchForm.addEventListener("submit", (e) => {
        console.log("SUBMIT FORM");
        e.preventDefault();

        const valor = searchInput.value.trim();
        if (!valor) {
            return;
        }

        if (valor.startsWith("#")) {
            filtrosActivos.tag = valor.slice(1).trim() || null;
        } else {
            filtrosActivos.tag = null;
        }

        buscarPublicacionesPorTagConFiltros(filtrosActivos);
    });
});


document.addEventListener('click', async (e) => {

    if (e.target.classList.contains('btn-delete-comment')) {
        const comentarioId = e.target.dataset.id;

        if (!confirm('¿Eliminar este comentario?')) return;

        const ok = await borrarComentario(comentarioId);
        if (ok) {
            e.target.closest('.comment-item').remove();
        }
    }

    if (e.target.classList.contains('btn-edit-comment')) {
        const comentarioId = e.target.dataset.id;
        const commentItem = e.target.closest('.comment-item');
        const textEl = commentItem.querySelector('.comment-text');

        const nuevoTexto = prompt('Editar comentario:', textEl.textContent);
        if (!nuevoTexto || !nuevoTexto.trim()) return;

        const ok = await editarComentario(comentarioId, nuevoTexto.trim());
        if (ok) {
            textEl.textContent = nuevoTexto.trim();
        }
    }
});
