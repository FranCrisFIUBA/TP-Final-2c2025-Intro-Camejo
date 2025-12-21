function cargarNavbar() {
    fetch('./navbar.html')
        .then(response => response.text())
        .then(data => {
            const container = document.getElementById('navbar-container');
            if (!container) return;

            container.innerHTML = data;

            // Esperar a que el DOM inyectado exista
            setTimeout(inicializarNavbar, 50);
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function inicializarNavbar() {
    const addButton = document.getElementById('add-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const overlay = document.getElementById('overlay');
    const profileButton = document.getElementById('profile-button');

    function toggleDropdown() {
        if (!dropdownMenu || !overlay) return;

        dropdownMenu.classList.toggle('show');
        overlay.classList.toggle('show');
    }

    if (addButton) {
        addButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            dropdownMenu?.classList.remove('show');
            overlay.classList.remove('show');
        });
    }

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            dropdownMenu?.classList.remove('show');
            overlay?.classList.remove('show');
        });
    });

    document.addEventListener('click', (e) => {
        if (
            dropdownMenu?.classList.contains('show') &&
            !dropdownMenu.contains(e.target) &&
            e.target !== addButton
        ) {
            dropdownMenu.classList.remove('show');
            overlay?.classList.remove('show');
        }
    });

    document.querySelector(".icon-bar.home")?.addEventListener("click", () => {
        window.location.href = "index.html";
    });

    document.querySelector(".icon-bar.search")?.addEventListener("click", () => {
        window.location.href = "search.html";
    });

    profileButton?.addEventListener("click", () => {
        window.location.href = "perfil.html";
    });
}

/* =========================
   CONTROL DE LOGIN GLOBAL
========================= */

document.addEventListener('DOMContentLoaded', () => {
    const estaLogeado = localStorage.getItem('usuarioLogeado') === 'true';

    const navbarContainer = document.getElementById('navbar-container');
    const mainContent = document.querySelector('.main-content');

    if (!estaLogeado) {
        console.log('Usuario NO logeado → navbar oculto');

        // Ocultar completamente el navbar
        if (navbarContainer) {
            navbarContainer.style.display = 'none';
        }

        // Quitar margen reservado al sidebar
        if (mainContent) {
            mainContent.style.marginLeft = '0';
        }

        return;
    }

    console.log('Usuario logeado → navbar visible');

    // Restaurar estilos por si venís de otra página
    if (navbarContainer) {
        navbarContainer.style.display = 'block';
    }

    if (mainContent) {
        mainContent.style.marginLeft = 'calc(67px + var(--gap-max))';
    }

    cargarNavbar();
});
