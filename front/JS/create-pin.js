const API_BASE = "http://localhost:3000";
const API_PUBLICACIONES = API_BASE + "/publicaciones";

const formPublicacion = document.getElementById("form-publicacion");
const fileInput = document.getElementById("file-input");
const previewImg = document.getElementById("preview-img");
const textPrompt = document.getElementById("text-prompt");

const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
const btnTrigger = document.getElementById("btn-subir-imagen-trigger");
const pinContainer = document.querySelector(".pin-container");

btnTrigger.addEventListener("click", () => {
    fileInput.click();
});

function aplicarRatio(ratio) {
    // Limpieza total
    pinContainer.classList.remove(
        "square",
        "horizontal",
        "vertical",
        "original"
    );

    // 🔴 CRÍTICO: limpiar estilos inline
    pinContainer.style.width = "";
    pinContainer.style.height = "";

    previewImg.style.width = "100%";
    previewImg.style.height = "100%";

    if (ratio === "1:1") {
        pinContainer.classList.add("square");
        previewImg.style.objectFit = "cover";
    }
    else if (ratio === "16:9") {
        pinContainer.classList.add("horizontal");
        previewImg.style.objectFit = "cover";
    }
    else if (ratio === "4:5") {
        pinContainer.classList.add("vertical");
        previewImg.style.objectFit = "cover";
    }
    else if (ratio === "original") {
        pinContainer.classList.add("original");
        previewImg.style.objectFit = "contain";

        if (imagenNatural.width && imagenNatural.height) {
            pinContainer.style.width = imagenNatural.width + "px";
            pinContainer.style.height = imagenNatural.height + "px";
        }
    }
}


let imagenNatural = { width: 0, height: 0 };

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            imagenNatural.width = img.naturalWidth;
            imagenNatural.height = img.naturalHeight;

            previewImg.src = e.target.result;
            previewImg.style.display = "block";
            textPrompt.style.display = "none";

            // ✅ Seleccionar ORIGINAL por defecto
            const originalInput = document.querySelector(
                'input[name="aspect_ratio"][value="original"]'
            );
            if (originalInput) {
                originalInput.checked = true;
                aplicarRatio("original");
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

const ratioInputs = document.querySelectorAll('input[name="aspect_ratio"]');

ratioInputs.forEach(input => {
    input.addEventListener("change", () => {
        aplicarRatio(input.value);
    });
});



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

    const selectedRatio = formData.get("aspect_ratio");

    let ancho = null;
    let alto = null;

    if (selectedRatio === "1:1") {
        ancho = 1080;
        alto = 1080;
    } else if (selectedRatio === "16:9") {
        ancho = 1920;
        alto = 1080;
    } else if (selectedRatio === "4:5") {
        ancho = 1080;
        alto = 1350;
    }

    if (ancho && alto) {
        formData.set("ancho_imagen", ancho);
        formData.set("alto_imagen", alto);
    }

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

