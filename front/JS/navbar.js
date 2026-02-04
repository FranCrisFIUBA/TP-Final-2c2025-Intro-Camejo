const API_BASE = 'http://127.0.0.1:3000';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const navbarContainer = document.getElementById('navbar-container');
    const usuarioLogueado = obtenerUsuarioLogueado();

    if (!container) return;

    // Manejo de estado de navegación (Clases de layout)
    if (!usuarioLogueado) {
        container.classList.replace('con-navbar', 'sin-navbar');
        if (navbarContainer) {
            navbarContainer.innerHTML = '';
            navbarContainer.style.display = 'none';
        }
        controlarAuthButtons(null);
        return;
    }

    container.classList.replace('sin-navbar', 'con-navbar');
    cargarNavbar();
});

// --- FUNCIONES DE UTILIDAD ---

function obtenerUsuarioLogueado() {
    const data = localStorage.getItem("usuarioLogueado");
    return data ? JSON.parse(data) : null;
}

// Función centralizada para navegar limpiando datos temporales
function navegarA(url, limpiarPin = true) {
    if (limpiarPin) localStorage.removeItem("pinParaEditar");
    location.href = url;
}

function controlarAuthButtons(usuario) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.classList.toggle('hidden', !!usuario);
    }
}

// --- CARGA Y LÓGICA DE NAVBAR ---

function cargarNavbar() {
    fetch('./navbar.html')
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById('navbar-container');
            if (!container) return;

            container.innerHTML = html;
            container.style.display = 'block';

            // Una vez que el HTML existe en el DOM, inicializamos todo
            inicializarNavbar();
            controlarAuthButtons(obtenerUsuarioLogueado());
        })
        .catch(err => console.error('Error loading navbar:', err));
}

function inicializarNavbar() {
    const usuarioLogueado = obtenerUsuarioLogueado();
    if (!usuarioLogueado) return;

    // 1. Referencias de Elementos (Agrupadas)
    const el = {
        sidebar: document.querySelector(".sidebar"),
        avatarImg: document.querySelector(".user-avatar img"),
        addButton: document.getElementById('add-button'),
        dropdownMenu: document.getElementById('dropdown-menu'),
        overlay: document.getElementById('overlay'),
        profileButton: document.getElementById('profile-button'),
        boardForm: document.getElementById('board-form'),
        createBoardBtn: document.getElementById('create-board'),
        btnFiltro: document.querySelector(".btn-filtros"),
        panelFiltros: document.querySelector(".filters-panel")
    };

    if (el.sidebar) el.sidebar.style.display = "flex";

    // 2. Configuración de Avatar
    if (el.avatarImg) {
        el.avatarImg.src = usuarioLogueado.icono
            ? `${API_BASE}/iconos/${usuarioLogueado.icono}`
            : "./img/avatar-default.jpg";
    }

    // 3. EVENTOS DE NAVEGACIÓN (Usando la función centralizada)
    document.querySelector(".logo")?.addEventListener("click", () => navegarA("index.html"));
    document.querySelector(".icon-bar.home")?.addEventListener("click", () => navegarA("index.html"));
    
    document.querySelector(".icon-bar.search")?.addEventListener("click", () => {
        navegarA(`perfil.html?id=${usuarioLogueado.id}&tab=busquedas`);
    });

    document.querySelector(".icon-bar.boards")?.addEventListener("click", () => {
        navegarA(`perfil.html?id=${usuarioLogueado.id}&tab=tableros`);
    });

    el.profileButton?.addEventListener("click", () => {
        navegarA(`perfil.html?id=${usuarioLogueado.id}`, false); // No limpia pin aquí si no quieres
    });

    // 4. LÓGICA DE UI (Dropdowns y Filtros)
    el.addButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        el.dropdownMenu?.classList.toggle('show');
        el.overlay?.classList.toggle('show');
    });

    el.btnFiltro?.addEventListener("click", () => {
        el.panelFiltros?.classList.toggle("activo");
    });

    // Cerrar todo al hacer clic en el overlay
    el.overlay?.addEventListener('click', () => {
        el.dropdownMenu?.classList.remove('show');
        el.boardForm?.classList.remove('show');
        el.overlay?.classList.remove('show');
    });

    // 5. EVENTO CREAR TABLERO (Resumido)
    el.createBoardBtn?.addEventListener('click', async () => {
        const boardInput = document.getElementById('board-name');
        const tagsInput = document.getElementById('board-tags');
        const titulo = boardInput.value.trim();

        if (!titulo) return alert('Ingresá un nombre para el tablero');

        try {
            const res = await fetch(`${API_BASE}/tableros`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: usuarioLogueado.id,
                    titulo,
                    etiquetas: tagsInput?.value.trim() || ""
                })
            });

            if (res.ok) {
                if (window.location.pathname.includes('perfil.html')) location.reload();
                else alert("¡Tablero creado!");
            }
        } catch (err) { console.error(err); }
    });
}