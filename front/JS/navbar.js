const API_BASE = 'http://127.0.0.1:3000';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    const navbarContainer = document.getElementById('navbar-container');

    const usuarioLogueado = obtenerUsuarioLogueado();

    if (!container) return;

    if (!usuarioLogueado) {
        container.classList.remove('con-navbar');
        container.classList.add('sin-navbar');

        if (navbarContainer) {
            navbarContainer.innerHTML = '';
            navbarContainer.style.display = 'none';
        }

        controlarAuthButtons();
        return;
    }

    container.classList.remove('sin-navbar');
    container.classList.add('con-navbar');

    cargarNavbar();
    controlarAuthButtons();
});


function obtenerUsuarioLogueado() {
    const data = localStorage.getItem("usuarioLogueado");
    return data ? JSON.parse(data) : null;
}

function cargarNavbar() {
    fetch('./navbar.html')
        .then(res => res.text())
        .then(html => {
            const container = document.getElementById('navbar-container');
            if (!container) return;

            container.innerHTML = html;
            container.style.display = 'block';

            inicializarNavbar();
        })
        .catch(err => console.error('Error loading navbar:', err));
}


function controlarAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    const usuarioLogueado = obtenerUsuarioLogueado();
    authButtons.classList.toggle('hidden', !!usuarioLogueado);
}


function inicializarNavbar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    sidebar.style.display = "flex";

    const usuarioLogueado = obtenerUsuarioLogueado();
    if (!usuarioLogueado) return;


    const avatarImg = document.querySelector(".user-avatar img");
    if (avatarImg) {
        avatarImg.src = usuarioLogueado.icono
            ? `${API_BASE}/iconos/${usuarioLogueado.icono}`
            : "./img/avatar-default.jpg";
    }
    const addButton = document.getElementById('add-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const overlay = document.getElementById('overlay');
    const profileButton = document.getElementById('profile-button');
    const createBoardItem = document.querySelector('.dropdown-item[href="create-board.html"]');
    const boardform = document.getElementById('board-form');
    const boardInput = document.getElementById('board-name');
    const cancelBoardBtn = document.getElementById('cancel-board');
    const createBoardBtn = document.getElementById('create-board');
   
    function abrirformTablero() {
        cerrarDropdown();
        boardform.classList.add('show');
        overlay.classList.add('show');
        boardInput.value = '';
        boardInput.focus();
    }

    function cerrarformTablero() {
        boardform.classList.remove('show');
        overlay.classList.remove('show');
    }

        function cerrarDropdown() {
            dropdownMenu?.classList.remove('show');
            overlay?.classList.remove('show');
        }

        function toggleDropdown() {
            dropdownMenu?.classList.toggle('show');
            overlay?.classList.toggle('show');
        }

        addButton?.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });

        overlay?.addEventListener('click', () => {
        cerrarDropdown();
        cerrarformTablero();
    });
    cancelBoardBtn?.addEventListener('click', cerrarformTablero);

    createBoardBtn?.addEventListener('click', () => {
        const nombre = boardInput.value.trim();

        if (!nombre) {
            alert('Ingresá un nombre para el tablero');
            return;
        }

        console.log('Crear tablero:', nombre);
        cerrarformTablero();
    });
    createBoardItem?.addEventListener('click', e => {
        e.preventDefault();
        abrirformTablero();
    });


    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            
            if (href === 'create-pin.html') {
                localStorage.removeItem("pinParaEditar");
            }
            
            cerrarDropdown();
        });
    });
    document.querySelector(".logo")?.addEventListener("click", () => {
        localStorage.removeItem("pinParaEditar");
        location.href = "index.html";
    });

    document.querySelector(".icon-bar.home")?.addEventListener("click", () => {
        localStorage.removeItem("pinParaEditar");
        location.href = "index.html";
    });     

    document.querySelector(".icon-bar.search")
        ?.addEventListener("click", () => location.href = "search.html");

    profileButton?.addEventListener("click", () => {
        location.href = `perfil.html?id=${usuarioLogueado.id}`;
    });
}


const btnFiltro = document.querySelector(".btn-filtros");
const panelFiltros = document.querySelector(".filters-panel");

btnFiltro.addEventListener("click", () => {
  panelFiltros.classList.toggle("activo");
});
