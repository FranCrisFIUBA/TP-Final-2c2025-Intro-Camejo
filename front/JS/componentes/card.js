
const API_BASE_URL = 'http://127.0.0.1:3000';
const API_IMAGENES = API_BASE_URL + '/imagenes';
const API_ICONOS = API_BASE_URL + '/iconos';

export function crearCard(
  card,
  {
    onOpenModal = () => {},
    onGoToProfile = () => {},
    editable = false,
    onEdit = () => {},
    onDelete = () => {}
  } = {}
) {
    const AVATAR_DEFAULT = './img/avatar-default.jpg';
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.setAttribute("data-id", card.id);

    const img = document.createElement("img");
    img.src = card.imagen ? `${API_IMAGENES}/${card.imagen}` : '';
    img.alt = "Imagen de " + (card.usuario_nombre || '');
    img.className = "card-image";

    cardDiv.appendChild(img);

    cardDiv.addEventListener("click", (e) => {
        if (!e.target.closest('.card-author')) {
            onOpenModal(card);
        }
    });

    if (card.ancho_imagen && card.alto_imagen) {
        img.style.aspectRatio = card.ancho_imagen / card.alto_imagen;
        img.style.objectFit = "cover";
    }

    const content = document.createElement("div");
    content.className = "card-content";

    const footer = document.createElement("div");
    footer.className = "card-footer";

    footer.innerHTML = `
        <div class="card-author">
            <img src="${card.usuario_icono ? `${API_ICONOS}/${card.usuario_icono}` : AVATAR_DEFAULT}" class="author-avatar">
            <span class="author-name">${card.usuario_nombre || ''}</span>
        </div>
    `;
    if (editable) {
        const actions = document.createElement("div");
        actions.className = "card-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "card-action-btn edit";
        editBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;

        editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            onEdit(card);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "card-action-btn delete";
        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;

        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            onDelete(card);
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        footer.appendChild(actions);
    }


    const authorElement = footer.querySelector('.card-author');

    authorElement.addEventListener("click", (e) => {
        e.stopPropagation();
        onGoToProfile(card.usuario_id);
    });


    content.appendChild(footer);
    
    cardDiv.appendChild(content);

    return cardDiv;
}

