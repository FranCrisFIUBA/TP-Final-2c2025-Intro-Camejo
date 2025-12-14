function cargarNavbar() {
    fetch('./navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            setTimeout(inicializarNavbar, 100);
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function inicializarNavbar() {
    console.log('Inicializando navbar...'); 
    
    const addButton = document.getElementById('add-button');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const overlay = document.getElementById('overlay');
    const profileButton = document.getElementById('profile-button');
    
    console.log('Elementos encontrados:', { addButton, dropdownMenu, overlay, profileButton }); 
    
    // Función para mostrar y ocultar el menú desplegable
    function toggleDropdown() {
        if (dropdownMenu && overlay) {
            const isShowing = dropdownMenu.classList.contains('show');
            dropdownMenu.classList.toggle('show');
            overlay.classList.toggle('show');
            console.log('Dropdown toggled. Showing:', !isShowing); 
        }
    }
    
    // botón "Agregar"
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Add button clicked'); 
            toggleDropdown();
        });
    } else {
        console.error('Add button not found');
    }
    
    // Cerrar el menú al hacer clic fuera
    if (overlay) {
        overlay.addEventListener('click', function() {
            console.log('Overlay clicked - closing dropdown'); 
            dropdownMenu.classList.remove('show');
            overlay.classList.remove('show');
        });
    }
    
    // Cerrar el menú al hacer clic en una opción
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            console.log('Dropdown item clicked'); 
            dropdownMenu.classList.remove('show');
            overlay.classList.remove('show');
        });
    });
    
    // Cerrar menú al hacer clic en cualquier parte del documento
    document.addEventListener('click', function(e) {
        if (dropdownMenu && dropdownMenu.classList.contains('show') && 
            !dropdownMenu.contains(e.target) && 
            e.target !== addButton) {
            console.log('Click outside - closing dropdown'); 
            dropdownMenu.classList.remove('show');
            overlay.classList.remove('show');
        }
    });
    
    const homeBtn = document.querySelector(".icon-bar.home");
    const searchBtn = document.querySelector(".icon-bar.search");

    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "index.html"; 
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            window.location.href = "search.html";
        });
    }

    if (profileButton) {
        profileButton.addEventListener("click", () => {
            window.location.href = "perfil.html";
        });
    }
}

document.addEventListener('DOMContentLoaded', cargarNavbar);