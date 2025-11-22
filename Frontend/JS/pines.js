// Función para cargar y mostrar los cards
async function cargarCards() {
    try {
        console.log('Cargando pines desde API...');
        const response = await fetch('./data1.json'); // Cambiado a tu endpoint
        if (!response.ok) {
            throw new Error('No se pudo cargar los pines');
        }
        const data = await response.json();
        console.log('Datos cargados:', data);
        
        if (data.success && data.data) {
            displayCards(data.data);
        } else {
            throw new Error('Estructura de datos inválida');
        }
    } catch (error) {
        console.error('Error loading cards:', error);
        jsonError();
    }
}

// Función para mostrar los cards dinámicamente
function displayCards(pines) {
    const container = document.getElementById('cards-container');
    
    if (!container) {
        console.error('No se encontró el contenedor de cards');
        return;
    }
    
    console.log('Mostrando', pines.length, 'pines');
    container.innerHTML = ''; // Limpiar contenedor
    
    pines.forEach(pin => {
        const cardElement = crearCard(pin);
        container.appendChild(cardElement);
    });
}

// Función para crear el HTML de cada card
function crearCard(pin) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-id', pin.id);
    
    cardDiv.innerHTML = `
        <img src="${pin.url_imagen}" alt="Imagen de ${pin.titulo}" class="card-image">
        <div class="card-content">
            <div class="card-footer">
                <div class="card-author">
                    <img src="${pin.usuario.foto_perfil}" alt="Avatar de ${pin.usuario.nombre_usuario}" class="author-avatar">
                    <span class="author-name">${pin.usuario.nombre_usuario}</span>
                </div>
                <div class="card-actions">
                    <button class="action-btn">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                        </svg>
                        <span>${pin.estadisticas.total_likes}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    cardDiv.addEventListener('click', () => {
        openCardModal(pin);
    });
    
    return cardDiv;
}

function openCardModal(pin) {
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
                        <img src="${pin.url_imagen}" alt="Imagen de ${pin.titulo}" class="modal-image">
                        <div class="modal-author-info">
                            <img src="${pin.usuario.foto_perfil}" alt="Avatar de ${pin.usuario.nombre_usuario}" class="modal-author-avatar">
                            <span class="modal-author-name">${pin.usuario.nombre_usuario}</span>
                            <div class="modal-likes">
                                <svg class="like-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                                </svg>
                                <span>${pin.estadisticas.total_likes}</span>
                            </div>
                        </div>
                        <div class="modal-tags">
                            ${pin.etiquetas.map(etiqueta => 
                                `<span class="tag">${etiqueta.nombre}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="modal-comments-section">
                        <h3>Comentarios (${pin.comentarios.length})</h3>
                        <div class="comments-container">
                            ${pin.comentarios.length > 0 ? 
                                pin.comentarios.map(comentario => `
                                    <div class="comment">
                                        <div class="comment-author">
                                            <img src="${comentario.usuario.foto_perfil}" alt="${comentario.usuario.nombre_usuario}" class="comment-avatar">
                                            <span class="comment-author-name">${comentario.usuario.nombre_usuario}</span>
                                        </div>
                                        <p class="comment-content">${comentario.contenido}</p>
                                        <span class="comment-date">${formatearFecha(comentario.fecha_publicacion)}</span>
                                    </div>
                                `).join('') : 
                                '<p class="no-comments">Aún no hay comentarios. ¡Sé el primero en comentar!</p>'
                            }
                        </div>
                        <div class="comment-form">
                            <textarea placeholder="Añade un comentario..." class="comment-input"></textarea>
                            <button class="comment-submit">Comentar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', closeCardModal);
        overlay.addEventListener('click', closeCardModal);
        
        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeCardModal();
            }
        });
        
        // Agregar funcionalidad al botón de comentar
        const commentSubmit = modal.querySelector('.comment-submit');
        const commentInput = modal.querySelector('.comment-input');
        
        commentSubmit.addEventListener('click', () => {
            const comentario = commentInput.value.trim();
            if (comentario) {
                // Aquí puedes agregar la lógica para enviar el comentario
                console.log('Nuevo comentario:', comentario);
                commentInput.value = '';
                // Recargar los comentarios o agregar el nuevo comentario localmente
            }
        });
        
    } else {
        // Actualizar el contenido del modal existente
        updateModalContent(modal, pin);
    }
    
    // Mostrar el modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

// Función para actualizar el contenido del modal
function updateModalContent(modal, pin) {
    const modalImage = modal.querySelector('.modal-image');
    const modalAuthorAvatar = modal.querySelector('.modal-author-avatar');
    const modalAuthorName = modal.querySelector('.modal-author-name');
    const modalLikes = modal.querySelector('.modal-likes span');
    const modalTags = modal.querySelector('.modal-tags');
    const commentsContainer = modal.querySelector('.comments-container');
    const commentsTitle = modal.querySelector('.modal-comments-section h3');
    
    modalImage.src = pin.url_imagen;
    modalImage.alt = `Imagen de ${pin.titulo}`;
    modalAuthorAvatar.src = pin.usuario.foto_perfil;
    modalAuthorName.textContent = pin.usuario.nombre_usuario;
    modalLikes.textContent = pin.estadisticas.total_likes;
    
    // Actualizar etiquetas
    modalTags.innerHTML = pin.etiquetas.map(etiqueta => 
        `<span class="tag">${etiqueta.nombre}</span>`
    ).join('');
    
    // Actualizar comentarios
    commentsTitle.textContent = `Comentarios (${pin.comentarios.length})`;
    commentsContainer.innerHTML = pin.comentarios.length > 0 ? 
        pin.comentarios.map(comentario => `
            <div class="comment">
                <div class="comment-author">
                    <img src="${comentario.usuario.foto_perfil}" alt="${comentario.usuario.nombre_usuario}" class="comment-avatar">
                    <span class="comment-author-name">${comentario.usuario.nombre_usuario}</span>
                </div>
                <p class="comment-content">${comentario.contenido}</p>
                <span class="comment-date">${formatearFecha(comentario.fecha_publicacion)}</span>
            </div>
        `).join('') : 
        '<p class="no-comments">Aún no hay comentarios. ¡Sé el primero en comentar!</p>';
}

// Función para formatear fechas
function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para cerrar el modal
function closeCardModal() {
    const modal = document.getElementById('card-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restaurar scroll
    }
}

function jsonError() {
    const container = document.getElementById('cards-container');
    if (!container) return;
    
    console.log('Problema con la carga de pines');
    container.innerHTML = `
        <div class="error-message">
            <p>No se pudieron cargar los pines. Intenta nuevamente más tarde.</p>
        </div>
    `;
}

// Función para ordenar los cards
function sortCards(orderType) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    
    const cards = Array.from(container.getElementsByClassName('card'));
    
    cards.sort((a, b) => {
        const aId = parseInt(a.getAttribute('data-id'));
        const bId = parseInt(b.getAttribute('data-id'));
        
        // Para obtener los datos originales necesitarías guardarlos en una variable global
        // o modificar la función para trabajar con los datos en memoria
        const pinA = window.pinesData ? window.pinesData.find(pin => pin.id === aId) : null;
        const pinB = window.pinesData ? window.pinesData.find(pin => pin.id === bId) : null;
        
        if (!pinA || !pinB) return 0;
        
        switch (orderType) {
            case 'Alpha':
                return pinA.titulo.localeCompare(pinB.titulo);
            case 'date':
                return new Date(pinB.fecha_publicacion) - new Date(pinA.fecha_publicacion);
            case 'popular':
                return pinB.estadisticas.total_likes - pinA.estadisticas.total_likes;
            default:
                return 0;
        }
    });
    
    // Limpiar y reinsertar cards ordenados
    container.innerHTML = '';
    cards.forEach(card => container.appendChild(card));
}

// Variable global para almacenar los datos de pines
window.pinesData = [];

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

        // Cerrar menú si clicás afuera
        document.addEventListener("click", () => {
            orderMenu.style.display = "none";
        });

        orderMenu.querySelectorAll("li").forEach(item => {
            item.addEventListener("click", (e) => {
                const tipo = e.target.dataset.order;
                console.log("Orden seleccionado:", tipo);
                orderMenu.style.display = "none";
                sortCards(tipo);
            });
        });
    } else {
        console.warn('No se encontraron elementos de ordenamiento');
    }
});

// Modificar la función displayCards para guardar los datos globalmente
function displayCards(pines) {
    const container = document.getElementById('cards-container');
    
    if (!container) {
        console.error('No se encontró el contenedor de cards');
        return;
    }
    
    console.log('Mostrando', pines.length, 'pines');
    container.innerHTML = ''; // Limpiar contenedor
    
    // Guardar datos globalmente para el ordenamiento
    window.pinesData = pines;
    
    pines.forEach(pin => {
        const cardElement = crearCard(pin);
        container.appendChild(cardElement);
    });
}