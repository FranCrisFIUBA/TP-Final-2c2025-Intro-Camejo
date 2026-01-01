const API_BASE = "http://localhost:3000";
const API_PUBLICACIONES = API_BASE + "/publicaciones";

const formPublicacion = document.getElementById("form-publicacion");
const fileInput = document.getElementById("file-input");
const previewImg = document.getElementById("preview-img");
const textPrompt = document.getElementById("text-prompt");

const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));

if (!usuarioLogueado || !usuarioLogueado.id) {
    alert("Debes iniciar sesión para publicar");
    location.href = "login.html";
}

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        previewImg.src = e.target.result;
        previewImg.style.width = "100%";
        textPrompt.style.display = "none";
    };
    reader.readAsDataURL(file);
});

formPublicacion.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!fileInput.files.length) {
        alert("Debes seleccionar una imagen");
        return;
    }

    const formData = new FormData(formPublicacion);
    formData.set("usuario_id", usuarioLogueado.id);

    try {
        const res = await fetch(API_PUBLICACIONES, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            alert("Error al publicar: " + JSON.stringify(err));
            return;
        }

        alert("¡Publicación creada con éxito!");
        window.location.href = "index.html";
    } catch (err) {
        console.error(err);
        alert("No se pudo conectar con el servidor");
    }
});
