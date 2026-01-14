const API_BASE_URL = 'http://127.0.0.1:3000';
const API_IMAGENES = API_BASE_URL + '/imagenes';
const API_ICONOS = API_BASE_URL + '/iconos';
const AVATAR_DEFAULT = './img/avatar-default.jpg';

// --- FUNCIONES DE NAVEGACIÓN Y UTILIDAD ---

function irAlPerfil(usuarioId) {
    window.location.href = `perfil.html?id=${usuarioId}`;
}

function obtenerUsuarioLogueado() {
    const data = localStorage.getItem("usuarioLogueado");
    return data ? JSON.parse(data) : null;
}

function obtenerImageRatio(card) {
    if (!card.ancho_imagen || !card.alto_imagen) return 'original';
    const ratio = card.ancho_imagen / card.alto_imagen;
    if (Math.abs(ratio - 1) < 0.1) return '1-1';
    if (Math.abs(ratio - 1.77) < 0.1) return '16-9';
    if (Math.abs(ratio - 0.8) < 0.1) return '4-5';
    return 'original';
}

function calcularFecha(fechaInput) {
    const fecha = new Date(fechaInput);
    const ahora = new Date();
    const difSeg = Math.floor((ahora - fecha) / 1000);
    const intervalos = { año: 31536000, mes: 2592000, día: 86400, hora: 3600, minuto: 60 };

    if (difSeg < 60) return "hace un momento";
    for (const [nombre, segundos] of Object.entries(intervalos)) {
        const valor = Math.floor(difSeg / segundos);
        if (valor >= 1) return `hace ${valor} ${nombre}${valor > 1 ? 's' : ''}`;
    }
    return "hace un momento";
}

function listarHashtags(etiquetas) {
    if (!etiquetas) return '';
    return etiquetas.split(',').map(tag => `<span class="hashtag">#${tag.trim()}</span>`).join('');
}

// --- LÓGICA PRINCIPAL DEL MODAL ---

export function closeCardModal() {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

export function abrirCardModal(card) {
    const modal = document.getElementById('card-modal');
    if (!modal) return;

    const imageRatio = obtenerImageRatio(card);
    const tieneImagen = !!card.imagen;

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-body">
                ${tieneImagen ? `
                <div class="modal-image-section">
                    <div class="modal-image-wrapper ratio-${imageRatio}">
                        <img src="${API_IMAGENES}/${card.imagen}" class="modal-image">
                    </div>
                    <div class="modal-author-info" style="cursor:pointer">
                        <img src="${card.usuario_icono ? `${API_ICONOS}/${card.usuario_icono}` : AVATAR_DEFAULT}"
                             class="modal-author-avatar" onerror="this.src='${AVATAR_DEFAULT}'">
                        <div class="modal-author-details">
                            <span class="modal-author-name">${card.usuario_nombre || 'Usuario'}</span>
                            <span class="modal-publish-date">${calcularFecha(card.fecha_edicion || card.fecha_publicacion)}</span>
                        </div>
                    </div>
                </div>` : ''}

                <div class="modal-comments-section">
                    <div class="modal-details">
                        <h2 class="modal-title">${card.titulo || 'Sin título'}</h2>
                        <div class="modal-hashtags">${listarHashtags(card.etiquetas)}</div>
                    </div>
                    <div class="comments-header">
                        <h3>Comentarios <span class="comments-count"></span></h3>
                    </div>
                    <div class="comments-container"></div>
                    <div class="add-comment-section">
                        <div class="comment-input-container">
                            <textarea class="comment-input" placeholder="Añade un comentario..." rows="3"></textarea>
                            <button class="comment-submit-btn">Publicar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // 1. Cargar comentarios iniciales
    cargarComentariosEnModal(card.id);

    // 2. Referencias a elementos
    const btnPublicar = modal.querySelector('.comment-submit-btn');
    const inputComentario = modal.querySelector('.comment-input');
    const commentsContainer = modal.querySelector('.comments-container');
    const modalAuthorInfo = modal.querySelector('.modal-author-info');

    // 3. Evento: Publicar Comentario
    btnPublicar.onclick = async () => {
        const texto = inputComentario.value.trim();
        const usuarioLogueado = obtenerUsuarioLogueado();
        if (!usuarioLogueado) return alert("Debes iniciar sesión para comentar");
        if (!texto) return;

        btnPublicar.disabled = true;
        const exito = await enviarComentario(card.id, texto, usuarioLogueado.id);
        if (exito) {
            inputComentario.value = "";
            await cargarComentariosEnModal(card.id);
        }
        btnPublicar.disabled = false;
    };

    // 4. Evento: Delegación para Editar/Borrar comentarios
    commentsContainer.onclick = async (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('btn-delete-comment')) {
            if (confirm('¿Eliminar comentario?')) {
                if (await borrarComentario(id)) e.target.closest('.comment-item').remove();
            }
        }
        if (e.target.classList.contains('btn-edit-comment')) {
            const textEl = e.target.closest('.comment-item').querySelector('.comment-text');
            const nuevo = prompt('Editar:', textEl.textContent);
            if (nuevo && nuevo.trim() && await editarComentario(id, nuevo.trim())) {
                textEl.textContent = nuevo.trim();
            }
        }
    };

    // 5. Evento: Ir al perfil del autor
    if (modalAuthorInfo) {
        modalAuthorInfo.onclick = () => {
            closeCardModal();
            irAlPerfil(card.usuario_id);
        };
    }

    // 6. Cerrar modal
    modal.querySelector('.modal-close').onclick = closeCardModal;
    modal.querySelector('.modal-overlay').onclick = closeCardModal;
}

// --- COMUNICACIÓN CON API (COMENTARIOS) ---

async function cargarComentariosEnModal(publicacionId) {
    const container = document.querySelector('.comments-container');
    const countEl = document.querySelector('.comments-count');
    try {
        const res = await fetch(`${API_BASE_URL}/comentarios/publicacion/${publicacionId}`);
        const comentarios = await res.json();
        const userLog = obtenerUsuarioLogueado();

        if (countEl) countEl.textContent = `(${comentarios.length})`;
        
        if (comentarios.length === 0) {
            container.innerHTML = '<p class="no-comments">No hay comentarios aún.</p>';
            return;
        }

        container.innerHTML = comentarios.map(c => `
            <div class="comment-item">
                <div class="comment-author">
                    <img src="${c.avatar ? `${API_ICONOS}/${c.avatar}` : AVATAR_DEFAULT}" class="comment-avatar">
                    <div class="comment-content">
                        <div class="comment-header">
                            <strong>${c.author}</strong>
                            ${userLog && userLog.id === c.usuario_id ? `
                                <div class="comment-actions">
                                    <button class="btn-edit-comment" data-id="${c.id}">Editar</button>
                                    <button class="btn-delete-comment" data-id="${c.id}">Borrar</button>
                                </div>` : ''}
                        </div>
                        <p class="comment-text">${c.text}</p>
                        <span class="comment-date">${calcularFecha(c.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    } catch (err) {
        container.innerHTML = '<p>Error al cargar comentarios.</p>';
    }
}

async function enviarComentario(pubId, contenido, uId) {
    const res = await fetch(`${API_BASE_URL}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: uId, publicacion_id: pubId, contenido })
    });
    return res.ok;
}

async function borrarComentario(id) {
    const user = obtenerUsuarioLogueado();
    const res = await fetch(`${API_BASE_URL}/comentarios/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user.id })
    });
    return res.ok;
}

async function editarComentario(id, contenido) {
    const user = obtenerUsuarioLogueado();
    const res = await fetch(`${API_BASE_URL}/comentarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido, usuario_id: user.id })
    });
    return res.ok;
}