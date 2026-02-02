const API_BASE_URL = 'http://127.0.0.1:3000';
const API_IMAGENES = API_BASE_URL + '/imagenes';
const API_ICONOS = API_BASE_URL + '/iconos';
const AVATAR_DEFAULT = './img/avatar-default.jpg';


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


export function closeCardModal() {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    window.location.reload();
}

async function quitarDelTablero(tableroId, publicacionId) {
  await fetch(`${API_BASE_URL}/tableros/${tableroId}/publicaciones/${publicacionId}`, {
    method: "DELETE"
  });
}


async function eliminarTablero(tableroId) {
  if (!confirm("¿Eliminar tablero?")) return;

  await fetch(`${API_BASE_URL}/tableros/${tableroId}`, {
    method: "DELETE"
  });

  cargarTableros(obtenerUsuarioLogueado().id);
}


async function obtenerTablerosGuardados(publicacionId) {
  const usuario = obtenerUsuarioLogueado();
  if (!usuario) return [];

  const res = await fetch(
    `${API_BASE_URL}/tableros/publicacion/${publicacionId}/usuario/${usuario.id}`
  );

  return await res.json();
}






async function renderizarTableros() {
  const container = document.querySelector('.tableros-list-container');
  const usuario = obtenerUsuarioLogueado();
  const publicacionId = window.publicacionActualId;

  if (!usuario || !publicacionId) return;

  try {
    const resTableros = await fetch(`${API_BASE_URL}/tableros/usuario/${usuario.id}`);
    const tableros = await resTableros.json();

    const resEstados = await fetch(`${API_BASE_URL}/tableros/usuario/${usuario.id}/publicacion/${publicacionId}/estados`);
    const idsDondeEstaGuardado = await resEstados.json();

    if (!tableros.length) {
      container.innerHTML = `<p class="mensaje-sinTableros" >No tenés tableros aún</p>`;
      return;
    }

    container.innerHTML = tableros.map(t => {
      const estaGuardado = idsDondeEstaGuardado.includes(t.id);
      
      return `
        <div class="lista-tableros">
          <span>${t.titulo}</span>
          <button class="btn-tablero-guardar ${estaGuardado ? 'guardado' : ''}" 
                  data-id="${t.id}" 
                  data-guardado="${estaGuardado}">
            ${estaGuardado ? '✔ Guardado' : 'Guardar'}
          </button>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p>Error al cargar tableros</p>`;
  }
}

async function obtenerLikes(publicacionId) {
    const usuario = obtenerUsuarioLogueado();
    const res = await fetch(`${API_BASE_URL}/likes/publicacion/${publicacionId}`);
    const likes = await res.json();
    const total = likes.length;

    let usuarioLike = null;

    if (usuario) {
        usuarioLike = likes.find(l => l.usuario_id === usuario.id);
    }

    return {
        total,
        usuario_dio_like: !!usuarioLike,
        like_id: usuarioLike ? usuarioLike.id : null
    };
}


export function abrirCardModal(card) {
    window.publicacionActualId = card.id;
    const modal = document.getElementById('card-modal');
    if (!modal) return;

    const imageRatio = obtenerImageRatio(card);
    const tieneImagen = !!card.imagen;
    const dioLike = card.usuario_dio_like; 

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
                <div class="modal-author-info">
                    <div class="modal-author-details-wrapper" id="irAPerfil" style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                        <img src="${card.usuario_icono ? `${API_ICONOS}/${card.usuario_icono}` : AVATAR_DEFAULT}"
                             class="modal-author-avatar" onerror="this.src='${AVATAR_DEFAULT}'">
                        <div class="modal-author-details">
                            <span class="modal-author-name">${card.usuario_nombre || 'Usuario'}</span>
                            <span class="modal-publish-date">${calcularFecha(card.fecha_edicion || card.fecha_publicacion)}</span>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-like-btn ${dioLike ? 'likeado' : ''}" 
                                id="btn-like-modal" 
                                data-like-id="${card.like_id || ''}">
                            <i class="${dioLike ? 'fa-solid' : 'fa-regular'} fa-heart like-icon"></i>
                            <span class="likes-numero">${card.likes_count || 0}</span>
                        </button>
                        <button class="modal-save-btn" id="btn-save-tablero">
                            <i class="fa-solid fa-plus add-icon"></i>
                        </button>
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
    const likeBtnModal = modal.querySelector('#btn-like-modal');

    if (likeBtnModal) {
        obtenerLikes(card.id).then(data => {
            const icon = likeBtnModal.querySelector('.like-icon');
            const numero = likeBtnModal.querySelector('.likes-numero');

            numero.textContent = data.total;

            if (data.usuario_dio_like) {
                likeBtnModal.classList.add('likeado');
                likeBtnModal.dataset.likeId = data.like_id;
                icon.className = 'fa-solid fa-heart like-icon';
            } else {
                likeBtnModal.classList.remove('likeado');
                likeBtnModal.dataset.likeId = '';
                icon.className = 'fa-regular fa-heart like-icon';
            }
        });
    }

    cargarComentariosEnModal(card.id);

    const btnPublicar = modal.querySelector('.comment-submit-btn');
    const inputComentario = modal.querySelector('.comment-input');
    const commentsContainer = modal.querySelector('.comments-container');
    const modalActions = modal.querySelector('.modal-actions');
    if (modalActions) {
        const popover = document.createElement('div');
        popover.className = 'tableros-popover';
        popover.innerHTML = `
            <button class="btn-add-tablero-ui">+ Crear Tablero</button>
            <form id="form-nuevo-tablero" style="display:none;">
                <input type="text" id="new-tablero-name" placeholder="Nombre del tablero" required>
                <input type="text" id="new-tablero-tags" placeholder="Etiquetas">
                <button type="submit">Crear</button>
            </form>
            <div class="tableros-list-container">
                <p style="font-size:12px; color:gray; padding:10px;">Cargando tableros...</p>
            </div>
        `;
        modalActions.appendChild(popover);
        const containerTableros = popover.querySelector('.tableros-list-container');
        const btnSave = modal.querySelector('#btn-save-tablero');
        const btnCrearTablero = popover.querySelector('.btn-add-tablero-ui');
        const formTablero = popover.querySelector('#form-nuevo-tablero');

        btnSave.onclick = (e) => {
            e.stopPropagation();
            popover.classList.toggle('active');
            renderizarTableros(); 
        };

        btnCrearTablero.onclick = () => {
            formTablero.style.display = formTablero.style.display === 'flex' ? 'none' : 'flex';
        };

containerTableros.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-tablero-guardar");
    if (!btn) return;

    const tableroId = btn.dataset.id;
    const publicacionId = window.publicacionActualId;

    if (!publicacionId) return alert("No hay publicación seleccionada");

    const estaGuardado = btn.dataset.guardado === "true";

    try {
        if (!estaGuardado) {
            const res = await fetch(`${API_BASE_URL}/tableros/${tableroId}/publicaciones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicacion_id: publicacionId })
            });

            if (res.ok) {
                btn.textContent = "✔ Guardado";
                btn.dataset.guardado = "true";
                btn.classList.add("guardado"); 
            } else {
                const data = await res.json();
                alert(data.error || "Error al guardar");
            }

        } else {
            const res = await fetch(`${API_BASE_URL}/tableros/${tableroId}/publicaciones/${publicacionId}`, { 
                method: "DELETE" 
            });

            if (res.ok) {
                btn.textContent = "Guardar";
                btn.dataset.guardado = "false";
                btn.classList.remove("guardado"); 
            } else {
                alert("Error al quitar del tablero");
            }
        }
    } catch (err) {
        console.error(err);
        alert("Error de conexión");
    }
});

        formTablero.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usuario = obtenerUsuarioLogueado();
            if (!usuario) return alert("No estás logueado");

            const titulo = document.getElementById('new-tablero-name').value.trim();
            const etiquetas = document.getElementById('new-tablero-tags').value.trim();

            if (!titulo) return alert("Ingresá un nombre");

            try {
                const res = await fetch(`${API_BASE_URL}/tableros`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuario.id,
                    titulo,
                    etiquetas
                })
                });

                if (!res.ok) {
                const err = await res.json();
                return alert(err.error || "Error creando tablero");
                }

                formTablero.reset();
                formTablero.style.display = "none";

                await renderizarTableros();
            } catch (err) {
                console.error(err);
                alert("Error de conexión");
            }
            });

        
        popover.onclick = (e) => e.stopPropagation();
    }

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

    const irPerfilUsuario = modal.querySelector('#irAPerfil');
    if (irPerfilUsuario) {
        irPerfilUsuario.onclick = () => {
            closeCardModal();
            irAlPerfil(card.usuario_id);
        };
    }
    const likeBtn = modal.querySelector('#btn-like-modal');
    if (likeBtn) {
    likeBtn.onclick = async (e) => {
        e.stopPropagation();

        const usuarioLogueado = obtenerUsuarioLogueado();
        if (!usuarioLogueado) return alert("Inicia sesión para dar like");

        const icon = likeBtn.querySelector('.like-icon');
        const numero = likeBtn.querySelector('.likes-numero');
        const isCurrentlyLiked = likeBtn.classList.contains('likeado');

        try {
            if (!isCurrentlyLiked) {
                const res = await fetch(`${API_BASE_URL}/likes/publicacion`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario_id: usuarioLogueado.id,
                        publicacion_id: card.id
                    })
                });

                const nuevoLike = await res.json();

                likeBtn.classList.add('likeado');
                likeBtn.dataset.likeId = nuevoLike.id;
                icon.className = 'fa-solid fa-heart like-icon';

            } else {
                const likeId = likeBtn.dataset.likeId;

                await fetch(`${API_BASE_URL}/likes/${likeId}`, {
                    method: 'DELETE'
                });

                likeBtn.classList.remove('likeado');
                likeBtn.dataset.likeId = '';
                icon.className = 'fa-regular fa-heart like-icon';
            }

            const estado = await obtenerLikes(card.id);
            numero.textContent = estado.total;

        } catch (err) {
            console.error("Error like:", err);
        }
    };
}

    modal.querySelector('.modal-close').onclick = closeCardModal;
    modal.querySelector('.modal-overlay').onclick = closeCardModal;
}


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







