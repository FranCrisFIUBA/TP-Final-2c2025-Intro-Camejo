import { crearCard } from './componentes/card.js';
import { abrirCardModal } from './componentes/modal.js';

const API_BASE_URL = 'http://127.0.0.1:3000';
const usuariosCache = new Map();

async function obtenerUsuarioPorId(usuarioId) {
    if (usuariosCache.has(usuarioId)) {
        return usuariosCache.get(usuarioId);
    }

    try {
        const res = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`);
        if (!res.ok) throw new Error('Error obteniendo usuario');

        const json = await res.json();
        const usuario = json.data;

        usuariosCache.set(usuarioId, usuario);
        return usuario;
    } catch (err) {
        console.error(`Error cargando usuario ${usuarioId}`, err);
        return null;
    }
}
const cargarPublicaciones = async () => {
    try {
        const respuesta = await fetch(`${API_BASE_URL}/publicaciones`);
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

function irAlPerfil(usuarioId) {
    window.location.href = `perfil.html?id=${usuarioId}`;
}

cargarPublicaciones();