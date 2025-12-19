const API_BASE_URL = '';
//temporl
let usuarioActual = 1; 

async function cargarCards() {
    try {
        console.log('Cargando cards desde la API...');
        
        const response = await fetch('localhost:3000/api/data');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos cargados desde API:', data);
        
        // Verificar likes del usuario actual para cada card
        const cardsConLikes = await Promise.all(
            data.cards.map(async (card) => {
                const userLiked = await verificarLikeUsuario(card.id, usuarioActual);
                return {
                    ...card,
                    userLiked: userLiked
                };
            })
        );
        
        listarPublicaciones(cardsConLikes);
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        jsonError();
    }
}

function listarPublicaciones(cards) {
    const container = document.getElementById('cards-container');
    
    if (!container) {
        console.error('No se encontró el contenedor de cards');
        return;
    }
    
    console.log('Mostrando', cards.length, 'cards');
    container.innerHTML = ''; 
    
    cards.forEach(card => {
        const cardElement = crearCard(card);
        container.appendChild(cardElement); 
    });
}

function crearCard(card) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.setAttribute("data-id", card.id);

    const img = document.createElement("img");
    img.src = card.image;
    img.alt = "Imagen de " + card.authorName;
    img.className = "card-image";

    if (card.width && card.height) {
        const aspectRatio = card.width / card.height;
        img.style.aspectRatio = aspectRatio;
        img.style.maxWidth = "100%"; 
        img.style.objectFit = "cover";
        img.style.display = "block";
    }

    const content = document.createElement("div");
    content.className = "card-content";

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const svgFill = card.userLiked ? 'currentColor' : 'none';
    const strokeWidth = card.userLiked ? '' : 'stroke-width="1.5"';
    
    footer.innerHTML = `
        <div class="card-author">
            <img src="${card.authorAvatar}" alt="Avatar" class="author-avatar">
            <span class="author-name">${card.authorName}</span>
        </div>
        <div class="card-actions">
            <button class="action-btn like-btn ${card.userLiked ? 'liked' : ''}" data-card-id="${card.id}">
                <svg class="action-icon" viewBox="0 0 24 24" fill="${svgFill}" stroke="currentColor">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28
                    2 8.5C2 5.42 4.42 3 7.5 3c1.74 0 3.41.81
                    4.5 2.09C13.09 3.81 14.76 3 16.5 3
                    C19.58 3 22 5.42 22 8.5c0 3.78-3.4
                    6.86-8.55 11.54L12 21.35Z" 
                    ${strokeWidth}/>
                </svg>
                <span class="like-count">${card.likes}</span>
            </button>
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
        irAlPerfil(card.id_author);
    });

    const likeBtn = footer.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(card.id, likeBtn, card);
    });

    return cardDiv;
}

// Función para manejar likes
async function toggleLike(cardId, likeBtn, card) {
    try {
        const likeCountElement = likeBtn.querySelector('.like-count') || likeBtn.querySelector('span');
        const isLiked = likeBtn.classList.contains('liked');
        const currentLikes = parseInt(likeCountElement.textContent);
        
        console.log('=== TOGGLE LIKE INICIADO ===');
        console.log('Card ID:', cardId);
        console.log('Usuario actual:', usuarioActual);
        console.log('Estado actual:', isLiked ? 'LIKED' : 'NOT LIKED');
        console.log('Likes actuales:', currentLikes);
        
        if (isLiked) {
            // Quitar like
            console.log('Eliminando like...');
            const response = await fetch(`/likes/publicacion/${cardId}/usuario/${usuarioActual}`, {
                method: 'DELETE'
            });
            
            console.log('Respuesta DELETE:', response.status, response.statusText);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Like eliminado exitosamente:', result);
                
                likeBtn.classList.remove('liked');
                const svg = likeBtn.querySelector('svg');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke-width', '1.5');
                likeCountElement.textContent = result.totalLikes;
                
                // Actualizar el objeto card
                if (card) {
                    card.userLiked = false;
                    card.likes = result.totalLikes;
                }
                                
                // Actualizar el like count en todas las instancias de esta card
                actualizarLikeCountEnTodasLasCards(cardId, result.totalLikes, false);
                
            } else {
                const errorText = await response.text();
                console.error('Error al eliminar like:', response.status, errorText);
                alert('Error al quitar like: ' + errorText);
            }
        } else {
            // Dar like
            console.log('Agregando like...');
            const likeData = {
                usuario_id: usuarioActual,
                publicacion_id: cardId
            };
            
            console.log('Enviando datos:', likeData);
            
            const response = await fetch('/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(likeData)
            });
            
            console.log('Respuesta POST:', response.status, response.statusText);
            
            if (response.ok) {
                const result = await response.json();
                console.log('Like agregado exitosamente:', result);
                
                likeBtn.classList.add('liked');
                const svg = likeBtn.querySelector('svg');
                svg.setAttribute('fill', 'currentColor');
                svg.removeAttribute('stroke-width');
                likeCountElement.textContent = result.totalLikes;
                
                // Actualizar el objeto card
                if (card) {
                    card.userLiked = true;
                    card.likes = result.totalLikes;
                }
                
                // Actualizar el like count en todas las instancias de esta card
                actualizarLikeCountEnTodasLasCards(cardId, result.totalLikes, true);
                
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
                console.error('Error al dar like:', errorData);
                    
                if (errorData.error && errorData.error.includes("Ya diste like")) {
                    console.log('Like ya existía, sincronizando estado...');
                    likeBtn.classList.add('liked');
                    const svg = likeBtn.querySelector('svg');
                    svg.setAttribute('fill', 'currentColor');
                    svg.removeAttribute('stroke-width');
                    
                    // Actualizar el conteo desde la base de datos
                    const countResponse = await fetch(`/likes/publicacion/${cardId}/count`);
                    if (countResponse.ok) {
                        const countData = await countResponse.json();
                        likeCountElement.textContent = countData.likes;
                    }
                } else {
                    alert('Error al dar like: ' + (errorData.error || 'Error desconocido'));
                }
            }
        }
        
        console.log('=== TOGGLE LIKE FINALIZADO ===');
    } catch (error) {
        console.error('Error crítico en toggle like:', error);
        alert('Error crítico: ' + error.message);
    }
}


// Función para actualizar like count en todas las instancias de una card
function actualizarLikeCountEnTodasLasCards(cardId, newCount, isLiked) {
    const allLikeButtons = document.querySelectorAll(`.like-btn[data-card-id="${cardId}"]`);
    allLikeButtons.forEach(btn => {
        const countElement = btn.querySelector('.like-count');
        if (countElement) {
            countElement.textContent = newCount;
        }
        
        const svg = btn.querySelector('svg');
        if (isLiked) {
            btn.classList.add('liked');
            svg.setAttribute('fill', 'currentColor');
            svg.removeAttribute('stroke-width');
        } else {
            btn.classList.remove('liked');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke-width', '1.5');
        }
    });
    
    // Actualizar en el modal si está abierto
    const modal = document.getElementById('card-modal');
    if (modal) {
        const modalLikeBtn = modal.querySelector('.modal-like-btn');
        const modalLikeCount = modal.querySelector('.modal-likes span');
        
        if (modalLikeBtn && modalLikeCount) {
            modalLikeCount.textContent = newCount;
            const modalSvg = modalLikeBtn.querySelector('svg');
            
            if (isLiked) {
                modalLikeBtn.classList.add('liked');
                modalSvg.setAttribute('fill', 'currentColor');
                modalSvg.removeAttribute('stroke-width');
            } else {
                modalLikeBtn.classList.remove('liked');
                modalSvg.setAttribute('fill', 'none');
                modalSvg.setAttribute('stroke-width', '1.5');
            }
        }
    }
}


// Función para verificar si el usuario actual dio like a una publicación
async function verificarLikeUsuario(publicacionId, usuarioId) {
    try {
        const response = await fetch(`/likes/publicacion/${publicacionId}/usuario/${usuarioId}`);
        if (response.ok) {
            const data = await response.json();
            return data.liked;
        }
        return false;
    } catch (error) {
        console.error('Error verificando like:', error);
        return false;
    }
}


// Función para redirigir al perfil del usuario
function irAlPerfil(id_author) {
    window.location.href = `perfil.html?usuario=${encodeURIComponent(id_author)}`;
    console.log(`Redirigiendo al perfil del autor ID: ${id_author}`);
}


function abrirCardModal(card) {
    let modal = document.getElementById('card-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'card-modal';
        modal.className = 'card-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body">
                    <div class="modal-image-section">
                        <img src="${card.image}" alt="Imagen de ${card.authorName}" class="modal-image">
                        <div class="modal-author-info">
                            <img src="${card.authorAvatar}" alt="Avatar de ${card.authorName}" class="modal-author-avatar">
                            <div class="modal-author-details">
                                <div class="modal-author-name">
                                    <span class="modal-author-name">${card.authorName}</span>
                                </div>
                                <span class="modal-publish-date">${calcularFecha(card.publishDate)}</span>
                            </div>
                            <div class="modal-likes">
                                <button class="modal-like-btn ${card.userLiked ? 'liked' : ''}" data-card-id="${card.id}">
                                    <svg class="like-icon" viewBox="0 0 24 24" fill="${card.userLiked ? 'currentColor' : 'none'}" stroke="currentColor">
                                        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" 
                                        ${card.userLiked ? '' : 'stroke-width="1.5"'}/>
                                    </svg>
                                    <span>${card.likes}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-comments-section">
                        <div class="modal-details">
                            <h2 class="modal-title">${card.title || 'Sin título'}</h2>
                            ${card.hashtags ? `<div class="modal-hashtags">${listarHashtags(card.hashtags)}</div>` : ''}
                        </div>
                        
                        <div class="comments-header">
                            <h3>Comentarios</h3>
                            <span class="comments-count">${card.comments ? card.comments.length : 0} comentarios</span>
                        </div>
                        
                        <div class="comments-container">
                            ${listarComentarios(card.comments || [])}
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
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const commentSubmitBtn = modal.querySelector('.comment-submit-btn');
        const commentInput = modal.querySelector('.comment-input');
        const modalLikeBtn = modal.querySelector('.modal-like-btn');
        const modalAuthorInfo = modal.querySelector('.modal-author-info');
        
        closeBtn.addEventListener('click', closeCardModal);
        overlay.addEventListener('click', closeCardModal);
        commentSubmitBtn.addEventListener('click', () => publicarComentario(card, commentInput));
        
        modalLikeBtn.addEventListener('click', (e) => {
            e.stopPropagation();    
            toggleLike(card.id, modalLikeBtn, card);
        });
        
        modalAuthorInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            irAlPerfil(card.id_author);
        });
        
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                publicarComentario(card, commentInput);
            }
        });

    } else {
        actualizarModal(modal, card);
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}


// Resto de tus funciones permanecen igual...
function actualizarModal(modal, card) {
    const modalLikeBtn = modal.querySelector('.modal-like-btn');
    if (modalLikeBtn) {
        modalLikeBtn.setAttribute('data-card-id', card.id);
        modalLikeBtn.classList.toggle('liked', card.userLiked || false);
        const likeSvg = modalLikeBtn.querySelector('svg');
        likeSvg.setAttribute('fill', card.userLiked ? 'currentColor' : 'none');
        if (card.userLiked) {
            likeSvg.removeAttribute('stroke-width');
        } else {
            likeSvg.setAttribute('stroke-width', '1.5');
        }
    }
}




function actualizarModal(modal, card) {
    const modalImage = modal.querySelector('.modal-image'); //Buscamos los elementos en el DOM
    const modalAuthorAvatar = modal.querySelector('.modal-author-avatar');
    const modalAuthorName = modal.querySelector('.modal-author-name');
    const modalPublishDate = modal.querySelector('.modal-publish-date');
    const modalLikes = modal.querySelector('.modal-likes span');
    const modalTitle = modal.querySelector('.modal-title');
    const modalHashtags = modal.querySelector('.modal-hashtags');
    const commentsContainer = modal.querySelector('.comments-container');
    const commentsCount = modal.querySelector('.comments-count');
    
    modalImage.src = card.image;
    modalImage.alt = `Imagen de ${card.authorName}`;
    modalAuthorAvatar.src = card.authorAvatar;
    modalAuthorName.textContent = card.authorName;
    modalPublishDate.textContent = calcularFecha(card.publishDate);
    modalLikes.textContent = card.likes;
    modalTitle.textContent = card.title || 'Sin título';
    
    if (card.hashtags && modalHashtags) {
        modalHashtags.innerHTML = listarHashtags(card.hashtags);
    }
    
    const comments = card.comments || [];
    commentsContainer.innerHTML = listarComentarios(comments);
    commentsCount.textContent = `${comments.length} comentario${comments.length !== 1 ? 's' : ''}`;
    
    if (card.width && card.height) {
        const aspectRatio = card.width / card.height;
        modalImage.style.aspectRatio = aspectRatio;
        modalImage.style.maxWidth = '100%';
        modalImage.style.objectFit = 'cover';
        
        const modalImageSection = modal.querySelector('.modal-image-section');
        const modalCommentsSection = modal.querySelector('.modal-comments-section');
        
        if (aspectRatio > 1) {
            modalImageSection.style.maxWidth = '60%';
            modalCommentsSection.style.flex = '1';
        } else {
            modalImageSection.style.maxWidth = '50%';
            modalCommentsSection.style.flex = '1';
        }
    } else {
        modalImage.style.aspectRatio = '';
        modalImage.style.maxWidth = '';
        modalImage.style.objectFit = 'contain';
        
        const modalImageSection = modal.querySelector('.modal-image-section');
        const modalCommentsSection = modal.querySelector('.modal-comments-section');
        
        modalImageSection.style.maxWidth = '70vw';
        modalCommentsSection.style.flex = '1';
    }
}



//  Math.floor() función que redondea un número hacia abajo al entero más cercano.
function calcularFecha(dateString) {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
}




function listarHashtags(hashtags) {
    if (!hashtags || !Array.isArray(hashtags)) return '';
    
    return hashtags.map(tag => {
        const cleanTag = tag.startsWith('#') ? tag.substring(1) : tag;
        return `<span class="hashtag" data-tag="${cleanTag}">#${cleanTag}</span>`;
    }).join('');
}



function listarComentarios(comments) {
    if (!comments || comments.length === 0) {
        return '<p class="no-comments">Aún no hay comentarios. ¡Sé el primero en comentar!</p>';
    }
    
    return comments.map(comment => `
        <div class="comment-item">
            <div class="comment-author">
                <img src="${comment.avatar || '/default-avatar.png'}" alt="Avatar" class="comment-avatar">
                <div class="comment-content">
                    <span class="comment-author-name">${comment.author}</span>
                    <p class="comment-text">${comment.text}</p>
                    <span class="comment-date">${calcularFecha(comment.date)}</span>
                </div>
            </div>
        </div>
    `).join('');
    
}



// temporal, correguir despues de tener la API
function publicarComentario(card, commentInput) {
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        commentInput.focus();
        return;
    }
    
    console.log('Nuevo comentario:', { 
        cardId: card.id,
        comment: commentText
    });
    
    const newComment = {
        author: 'Tú',
        text: commentText,
        date: new Date().toISOString(),
        avatar: card.authorAvatar 
    };
    if (!card.comments) card.comments = [];
    card.comments.push(newComment);
    
    const modal = document.getElementById('card-modal');
    if (modal) {
        actualizarModal(modal, card);
    }
    
    commentInput.value = '';
    
    showCommentSuccess();
}


// se muestra por consola que el comentario fue enviado
function showCommentSuccess() {
    console.log('Comentario publicado exitosamente');
}



//oculto el modal
function closeCardModal() {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}


// funcion que irfomar si algo salio mal con el json
function jsonError() {
    const container = document.getElementById('cards-container');
    if (!container) return;
    
    console.log('Error al cargar datos de la API');
    container.innerHTML = `
        <div class="error-message">
            <h3>Error al cargar las publicaciones</h3>
            <p>No se pudieron cargar los datos desde el servidor.</p>
        </div>
    `;
}





// funcion para ordenaar las cards, todavia falta solucionar el problema de que estan ordenadas verticalmente
function sortCards(orderType) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    
    const cards = Array.from(container.getElementsByClassName('card'));
    
    cards.sort((a, b) => {
        const aLikes = parseInt(a.querySelector('.action-btn span').textContent);
        const bLikes = parseInt(b.querySelector('.action-btn span').textContent);
        const aName = a.querySelector('.author-name').textContent;
        const bName = b.querySelector('.author-name').textContent;
        
        switch (orderType) {
            case 'Alpha':
                return aName.localeCompare(bName);
            case 'date':
                //falta
                return 0;
            case 'popular':
                return bLikes - aLikes;
            default:
                return 0;
        }
    });
    
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
}





document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM cargado, inicializando pines...');
    cargarCards();
    
    const orderBtn = document.querySelector(".order-by");
    const orderMenu = document.querySelector(".order-menu");

    if (orderBtn && orderMenu) {
        orderBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            orderMenu.style.display = orderMenu.style.display === "block" ? "none" : "block";
        });
        document.addEventListener("click", () => {
            orderMenu.style.display = "none";
        });

        orderMenu.querySelectorAll("li").forEach(item => {
            item.addEventListener("click", (e) => {
                const tipo = e.target.dataset.order;
                console.log("Orden seleccionado:", tipo);
                orderMenu.style.display = "none";
                sortCards(tipo); //tipo de ordenamiento
            });
        });
    } else {
        console.warn('No se encontraron elementos de ordenamiento');
    }
});