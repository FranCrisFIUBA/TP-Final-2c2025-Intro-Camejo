const API_BASE_URL = 'http://127.0.0.1:3000';

// Función para obtener las publicaciones
const cargarPublicaciones = async () => {
    try {
        const respuesta = await fetch(`${API_BASE_URL}/publicaciones`);
        if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`);

        const datos = await respuesta.json();
        const contenedor = document.querySelector(".cards-container") || document.querySelector("#cards-container");

        if (!contenedor) {
            console.error("No se encontró el contenedor en el HTML");
            return;
        }
        contenedor.innerHTML = "";
        datos.forEach(publicacion => {
            const nuevaCard = crearCard(publicacion);
            contenedor.appendChild(nuevaCard);
        });
    } catch (error) {
        console.error('Hubo un error al conectar con la API:', error);
    }
};

function crearCard(card) {
    const AVATAR_DEFAULT = './img/avatar-default.jpg';
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.setAttribute("data-id", card.id);

    const img = document.createElement("img");
    img.src = card.url_imagen; 
    img.alt = "Imagen de " + card.usuario_nombre;
    img.className = "card-image";

    if (card.ancho_imagen && card.alto_imagen) {
        const aspectRatio = card.ancho_imagen / card.alto_imagen;
        img.style.aspectRatio = aspectRatio;
        img.style.maxWidth = "100%"; 
        img.style.objectFit = "cover";
        img.style.display = "block";
    }

    const content = document.createElement("div");
    content.className = "card-content";

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const avatarSrc = card.usuario_icono && card.usuario_icono !== "" ? card.usuario_icono : AVATAR_DEFAULT;
    footer.innerHTML = `
        <div class="card-author">
            <img src="${avatarSrc}" alt="Avatar" class="author-avatar">
            <span class="author-name">${card.usuario_nombre}</span>
        </div>
        <div class="card-actions">
        </div>
    `;

    content.appendChild(footer);
    cardDiv.appendChild(img);
    cardDiv.appendChild(content);

    cardDiv.addEventListener("click", (e) => {
        if (!e.target.closest('.card-author') && !e.target.closest('.like-btn')) {
            abrirCardModal(card);
        }
    });
    
    const authorElement = footer.querySelector('.card-author');
    authorElement.addEventListener("click", (e) => {
        e.stopPropagation(); 
        irAlPerfil(card.usuario_id); 
    });

    return cardDiv;
}


function irAlPerfil(usuarioId) {
    window.location.href = `perfil.html?id=${usuarioId}`;
    console.log(`Redirigiendo al perfil del usuario ID: ${usuarioId}`);
}









function abrirCardModal(card) {
    const modal = document.getElementById('card-modal');
    if (!modal) return;

    const AVATAR_DEFAULT = './img/avatar-default.jpg';

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-body">
                <div class="modal-image-section">
                    <img 
                        src="${card.url_imagen}" 
                        class="modal-image"
                        style="width: ${card.ancho_imagen}px; height: ${card.alto_imagen}px; max-width: 100%; object-fit: contain;"
                    >
                    <div class="modal-author-info">
                        <img src="${card.usuario_icono || AVATAR_DEFAULT}" class="modal-author-avatar" onerror="this.src='${AVATAR_DEFAULT}'">
                        <div class="modal-author-details">
                            <span class="modal-author-name">${card.usuario_nombre}</span>
                            <span class="modal-publish-date">${calcularFecha(card.fecha_edicion)}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-comments-section">
                        <div class="modal-details">
                            <h2 class="modal-title">${card.titulo || 'Sin título'}</h2>
                            ${card.etiquetas ? `<div class="modal-hashtags">${listarHashtags(card.etiquetas)}</div>` : ''}
                        </div>
                        
                        <div class="comments-header">
                            <h3>Comentarios</h3>
                            
                        </div>
                        
                        <div class="comments-container">
                            
                        </div>
                        
                        <div class="add-comment-section">
                            <div class="comment-input-container">
                                <textarea 
                                    class="comment-input" 
                                    placeholder="Añade un comentario..."
                                    rows="3"
                                ></textarea>
                                <button class="comment-submit-btn">Publicar</button>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    `;

    // Mostrar el modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    cargarComentariosEnModal(card.id);
    const btnPublicar = modal.querySelector('.comment-submit-btn');
    const inputComentario = modal.querySelector('.comment-input');
    const modalAuthorInfo = modal.querySelector('.modal-author-info');
    btnPublicar.onclick = async () => {
        const texto = inputComentario.value.trim();
        if (!texto) return;

        const usuarioLogueado = obtenerUsuarioLogueado();

        if (!usuarioLogueado || !usuarioLogueado.id) {
            alert("Debes iniciar sesión para comentar");
            return;
        }

        btnPublicar.disabled = true;
        btnPublicar.textContent = "Publicando...";

        const exito = await enviarComentario(
            card.id,
            texto,
            usuarioLogueado.id
        );

        if (exito) {
            inputComentario.value = "";
            await cargarComentariosEnModal(card.id);
        }

        btnPublicar.disabled = false;
        btnPublicar.textContent = "Publicar";
    };



    modalAuthorInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            irAlPerfil(card.usuario_id);
    });
    
    inputComentario.onkeydown = (e) => {
    // Si presiona Enter pero NO presiona Shift (para permitir saltos de línea)
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Evita que se cree una línea nueva
        btnPublicar.click(); // Dispara el evento del botón
    }
    };
    // Eventos de cierre
    modal.querySelector('.modal-close').onclick = closeCardModal;
    modal.querySelector('.modal-overlay').onclick = closeCardModal;
}

function closeCardModal() {
    const modal = document.getElementById('card-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
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

function listarHashtags(etiquetas) {
    if (!etiquetas) return '';
    return etiquetas.split(',')
        .map(tag => `<span class="hashtag">#${tag.trim()}</span>`)
        .join('');
}


async function cargarComentariosEnModal(publicacionId) {
    const container = document.querySelector('.comments-container');
    const countElement = document.querySelector('.comments-count');
    const AVATAR_DEFAULT = './img/avatar-default.jpg';

    try {
        // Asegúrate de que la ruta coincida con tu backend
        const res = await fetch(`${API_BASE_URL}/comentarios/publicacion/${publicacionId}`);
        const comentarios = await res.json();

        // Actualizar contador si tienes el elemento en el HTML
        if (countElement) countElement.textContent = `${comentarios.length} comentarios`;

        if (comentarios.length === 0) {
            container.innerHTML = '<p class="no-comments">No hay comentarios aún. ¡Sé el primero!</p>';
            return;
        }

        // Renderizar usando tus clases CSS originales
        container.innerHTML = comentarios.map(com => `
            <div class="comment-item">
                <div class="comment-author">
                    <img src="${com.avatar || AVATAR_DEFAULT}" class="comment-avatar" onerror="this.src='${AVATAR_DEFAULT}'">
                    <div class="comment-content">
                        <span class="comment-author-name">${com.author}</span>
                        <p class="comment-text">${com.text}</p>
                        <span class="comment-date">${calcularFecha(com.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Hacer scroll automático al final para ver el nuevo comentario
        container.scrollTop = container.scrollHeight;

    } catch (err) {
        console.error("Error cargando comentarios:", err);
        container.innerHTML = '<p class="no-comments">Error al conectar con el servidor.</p>';
    }
}



function obtenerUsuarioLogueado() {
    const data = localStorage.getItem("usuarioLogueado");
    return data ? JSON.parse(data) : null;
}




async function enviarComentario(publicacionId, contenido, usuarioId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comentarios`, {
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



cargarPublicaciones();

