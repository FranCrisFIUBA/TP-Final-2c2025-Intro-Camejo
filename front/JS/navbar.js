const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));

document.addEventListener('DOMContentLoaded', () => {

    if (!usuarioLogueado) {
        return;
    }
    cargarNavbar();
});

function cargarNavbar() {
    fetch('./navbar.html')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('navbar-container');
            if (!container) return;

            container.innerHTML = html;
            container.style.display = 'block';

            inicializarNavbar();
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function inicializarNavbar() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;

    sidebar.style.display = "flex";

    // Avatar
    const avatarImg = document.querySelector(".user-avatar img");
    if (avatarImg) {
        avatarImg.src = usuarioLogueado.icono || "./img/avatar-default.jpg";
    }

    const addButton = document.getElementById('add-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const overlay = document.getElementById('overlay');
    const profileButton = document.getElementById('profile-button');

    function toggleDropdown() {
        dropdownMenu?.classList.toggle('show');
        overlay?.classList.toggle('show');
    }

    addButton?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleDropdown();
    });

    overlay?.addEventListener('click', () => {
        dropdownMenu?.classList.remove('show');
        overlay.classList.remove('show');
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            dropdownMenu?.classList.remove('show');
            overlay?.classList.remove('show');
        });
    });

    document.querySelector(".icon-bar.home")
        ?.addEventListener("click", () => location.href = "index.html");

    document.querySelector(".icon-bar.search")
        ?.addEventListener("click", () => location.href = "search.html");

    profileButton
        ?.addEventListener("click", () => location.href = "perfil.html");
}
