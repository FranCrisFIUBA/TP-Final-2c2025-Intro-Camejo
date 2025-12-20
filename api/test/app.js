const API_BASE = "http://localhost:3000"
const API_PUBLICACIONES = API_BASE + "/publicaciones";
const API_USUARIOS = API_BASE + "/usuarios";
const API_ICONOS = API_BASE + "/iconos";
const API_IMAGENES = API_BASE + "/imagenes";

const formUsuario = document.getElementById("form-usuario");
const formPublicacion = document.getElementById("form-publicacion");
const contenedorPublicaciones = document.getElementById("publicaciones");
const contenedorUsuarios = document.getElementById("usuarios");
const usuarioSelect = document.getElementById("usuario-select");
const btnOrden = document.getElementById("btn-orden");
const selectOrden = document.getElementById("orden");
const selectDir = document.getElementById("dir");

// ------------------ CREAR USUARIO ------------------
formUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(formUsuario);

    console.log("Form Data: " + JSON.stringify(formData))

    try {
        const res = await fetch(API_USUARIOS, { method: "POST", body: formData });
        console.log(res);
        if (!res.ok) {
            const err = await res.json();
            alert("Error: " + JSON.stringify(err));
            return;
        }
        formUsuario.reset();
        cargarUsuarios();
    } catch (err) {
        console.error(err);
    }
});

// Cargar usuarios y actualizar select
async function cargarUsuarios() {
    try {
        const res = await fetch(API_USUARIOS);
        if (!res.ok) throw new Error("Error al obtener usuarios");
        const usuarios = await res.json();

        // Mostrar usuarios en div
        contenedorUsuarios.innerHTML = "";
        usuarioSelect.innerHTML = "<option value=''>Seleccione usuario</option>";
        usuarios.forEach(u => {
            const div = document.createElement("div");
            div.className = "usuario";
            div.innerHTML = `
                <strong>ID:</strong> ${u.id}<br>
                <strong>Nombre:</strong> ${u.nombre}<br>
                ${u.icono ? `<img src="${API_ICONOS + "/" + u.icono}" alt="${u.nombre}">` : ''}
            `;
            contenedorUsuarios.appendChild(div);

            // Agregar al select para publicaciones
            const option = document.createElement("option");
            option.value = u.id;
            option.textContent = u.nombre;
            usuarioSelect.appendChild(option);
        });
    } catch (err) {
        console.error(err);
    }
}

// ------------------ CREAR PUBLICACIÓN ------------------
formPublicacion.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formPublicacion);

    try {
        const res = await fetch(API_PUBLICACIONES, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            alert("Error: " + JSON.stringify(err));
            return;
        }

        formPublicacion.reset();
        cargarPublicaciones();
    } catch (err) {
        console.error(err);
    }
});

// ------------------ LISTAR PUBLICACIONES ------------------
async function cargarPublicaciones() {
    const orden = selectOrden.value;
    const dir = selectDir.value;

    try {
        const res = await fetch(
            `${API_PUBLICACIONES}?orden=${orden}&dir=${dir}`
        );
        if (!res.ok) throw new Error("Error al obtener publicaciones");

        const publicaciones = await res.json();
        contenedorPublicaciones.innerHTML = "";

        publicaciones.forEach(pub => {
            const div = document.createElement("div");
            div.className = "publicacion";

            div.innerHTML = `
                <strong>ID:</strong> ${pub.id} <br>
                <strong>Título:</strong> ${pub.titulo} <br>
                <strong>Etiquetas:</strong> ${pub.etiquetas} <br>
                <strong>Usuario:</strong> ${pub.usuario_id} <br>
                <img 
                    src="${API_IMAGENES + "/" + pub.imagen}" 
                    alt="${pub.titulo}"
                    style="max-width: 300px"
                >
                <br>
                <button data-id="${pub.id}">Eliminar</button>
            `;

            div.querySelector("button").addEventListener("click", async () => {
                if (!confirm("¿Eliminar publicación?")) return;
                await fetch(`${API_PUBLICACIONES}/${pub.id}`, {
                    method: "DELETE"
                });
                cargarPublicaciones();
            });

            contenedorPublicaciones.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}

// ------------------ EVENTOS ------------------
btnOrden.addEventListener("click", cargarPublicaciones);

// Cargar al inicio
cargarUsuarios();
cargarPublicaciones();
