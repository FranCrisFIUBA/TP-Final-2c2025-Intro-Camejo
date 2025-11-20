// Función para cargar y mostrar los cards
async function cargarCards() {
    try {
        console.log('Cargando cards desde JSON...');
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el JSON');
        }
        const data = await response.json();
        console.log('Datos cargados:', data);
        displayCards(data.cards);
    } catch (error) {
        console.error('Error loading cards:', error);
        jsonError();
    }
}

// Función para mostrar los cards dinámicamente
function displayCards(cards) {
    const container = document.getElementById('cards-container');
    
    if (!container) {
        console.error('No se encontró el contenedor de cards');
        return;
    }
    
    console.log('Mostrando', cards.length, 'cards');
    container.innerHTML = ''; // Limpiar contenedor
    
    cards.forEach(card => {
        const cardElement = crearCard(card);
        container.appendChild(cardElement);
    });
}

// Función para crear el HTML de cada card
function crearCard(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.setAttribute('data-id', card.id);
    
    cardDiv.innerHTML = `
        <img src="${card.image}" alt="Imagen de ${card.authorName}" class="card-image">
        <div class="card-content">
            <div class="card-footer">
                <div class="card-author">
                    <img src="${card.authorAvatar}" alt="Avatar de ${card.authorName}" class="author-avatar">
                    <span class="author-name">${card.authorName}</span>
                </div>
                <div class="card-actions">
                    <button class="action-btn">
                        <svg class="action-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                        </svg>
                        <span>${card.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    cardDiv.addEventListener('click', () => {
        openCardModal(card);
    });
    
    return cardDiv;
}
function openCardModal(card) {
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
                            <span class="modal-author-name">${card.authorName}</span>
                            <div class="modal-likes">
                                <svg class="like-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                                </svg>
                                <span>${card.likes}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-comments-section">
                        <h3>Comentarios</h3>
                        <div class="comments-container">
                            <p class="no-comments">Aún no hay comentarios. ¡Sé el primero en comentar!</p>
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
    } else {
        // Actualizar el contenido del modal existente
        updateModalContent(modal, card);
    }
    
    // Mostrar el modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevenir scroll
}

// Función para actualizar el contenido del modal
function updateModalContent(modal, card) {
    const modalImage = modal.querySelector('.modal-image');
    const modalAuthorAvatar = modal.querySelector('.modal-author-avatar');
    const modalAuthorName = modal.querySelector('.modal-author-name');
    const modalLikes = modal.querySelector('.modal-likes span');
    
    modalImage.src = card.image;
    modalImage.alt = `Imagen de ${card.authorName}`;
    modalAuthorAvatar.src = card.authorAvatar;
    modalAuthorName.textContent = card.authorName;
    modalLikes.textContent = card.likes;
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
    
    console.log('Problema con el json');
    
}
// Función para ordenar los cards
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
                // Aqui ira el orden por fecha
                return 0;
            case 'popular':
                return bLikes - aLikes;
            default:
                return 0;
        }
    });
    
    // Limpiar y reinsertar cards ordenados
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

        // Cerrar menú si clicás afuera
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