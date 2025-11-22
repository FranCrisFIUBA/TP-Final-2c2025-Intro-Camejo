function cargarNavbar() {
    fetch('./navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            Navbar();
        })
        .catch(error => console.error('Error loading navbar:', error));
}

function Navbar() {
    const homeBtn = document.querySelector(".icon-bar.home");
    const searchBtn = document.querySelector(".icon-bar.search");
    const addBtn = document.querySelector(".icon-bar.add");

    if (homeBtn) {
        homeBtn.addEventListener("click", () => {
            window.location.href = "index.html"; 
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            window.location.href = ".html";
        });
    }

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            window.location.href = "create-pin.html";
        });
    }
}
document.addEventListener('DOMContentLoaded', cargarNavbar);