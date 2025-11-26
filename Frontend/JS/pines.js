async function cargarCards() {
    try {
        console.log('Cargando cards desde JSON...');
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el JSON');
        }
        const data = await response.json();
        console.log('Datos cargados:', data);
        listarPublicaciones(data.cards);
    } catch (error) {
        console.error('Error loading cards:', error);
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
        container.appendChild(cardElement); //agreganos las cards al container
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

    footer.innerHTML = `
        <div class="card-author">
            <img src="${card.authorAvatar}" alt="Avatar" class="author-avatar">
            <span class="author-name">${card.authorName}</span>
        </div>
        <div class="card-actions">
            <button class="action-btn">
                <svg class="action-icon" viewBox="0 0 24 24">
                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28
                    2 8.5C2 5.42 4.42 3 7.5 3c1.74 0 3.41.81
                    4.5 2.09C13.09 3.81 14.76 3 16.5 3
                    C19.58 3 22 5.42 22 8.5c0 3.78-3.4
                    6.86-8.55 11.54L12 21.35Z" fill="currentColor"/>
                </svg>
                <span>${card.likes}</span>
            </button>
        </div>
    `;

    content.appendChild(footer);
    cardDiv.appendChild(img);
    cardDiv.appendChild(content);
    
    cardDiv.addEventListener("click", (e) => {
        if (!e.target.closest('.card-author')) {
            abrirCardModal(card);
        }
    });
    
    const authorElement = footer.querySelector('.card-author');
    authorElement.addEventListener("click", (e) => {
        e.stopPropagation(); 
        irAlPerfil(card.id_author);
    });

    return cardDiv;
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
                                <svg class="like-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                                </svg>
                                <span>${card.likes}</span>
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
        
        closeBtn.addEventListener('click', closeCardModal);
        overlay.addEventListener('click', closeCardModal);
        commentSubmitBtn.addEventListener('click', () => publicarComentario(card, commentInput));
        
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                publicarComentario(card, commentInput);
            }
        });

        const modalAuthorName = modal.querySelector('.modal-author-info');
        modalAuthorName.addEventListener('click', (e) => {
            e.stopPropagation();
            irAlPerfil(card.id_author);
        });
    }
    
    actualizarModal(modal, card);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    modalAuthorName.style.cursor = 'pointer';
    modalAuthorName.style.pointerEvents = 'auto';
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
    
    console.log('Nuevo comentario:', { //imprime por consola el comentario
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
    
    console.log('Problema con el json');
    
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