import {API_IMAGENES_URL, API_PUBLICACIONES_URL} from "./api";

const formPublicacion = document.getElementById("form-publicacion");
const fileInput = document.getElementById("file-input");
const previewImg = document.getElementById("preview-img");
const textPrompt = document.getElementById("text-prompt");
const pinParaEditar = JSON.parse(localStorage.getItem("pinParaEditar"));
const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
const btnTrigger = document.getElementById("btn-subir-imagen-trigger");
const pinContainer = document.querySelector(".pin-container");

btnTrigger.addEventListener("click", () => {
    fileInput.click();
});

if (pinParaEditar) {
    document.title = "Editar Pin";
    const submitBtn = document.querySelector(".publish-btn");
    if(submitBtn) submitBtn.textContent = "Guardar cambios";
    
    formPublicacion.querySelector('[name="titulo"]').value = pinParaEditar.titulo || "";
    formPublicacion.querySelector('[name="etiquetas"]').value = pinParaEditar.etiquetas || "";
    
    if (pinParaEditar.imagen) {
        previewImg.src = `${API_IMAGENES_URL}${pinParaEditar.imagen}`;
        previewImg.style.display = "block";
        textPrompt.style.display = "none";
    }
}

const btnCancelar = document.querySelector(".cancel-btn");
btnCancelar.addEventListener("click", () => {
    localStorage.removeItem("pinParaEditar");
});

function aplicarRatio(ratio) {
    pinContainer.classList.remove(
        "square",
        "horizontal",
        "vertical",
        "original"
    );

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

    if (!fileInput.files.length && !pinParaEditar) {
        alert("Debes seleccionar una imagen");
        return;
    }

    const formData = new FormData(formPublicacion);
    formData.set("usuario_id", usuarioLogueado.id);
    
    if (pinParaEditar && fileInput.files.length === 0) {
        formData.delete("imagen");
    }
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
    
    let url = API_PUBLICACIONES_URL;
    let metodo = "POST";

    if (pinParaEditar) {
        url = `${API_PUBLICACIONES_URL}/${pinParaEditar.id}`;
        metodo = "PATCH";
        console.log("Editando pin:", pinParaEditar.id);
console.log("Archivo seleccionado:", fileInput.files[0]);
console.log("Campos en FormData:");
for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
}
    }

    try {
        const res = await fetch(url, {
            method: metodo,
            body: formData
        });
        const data = await res.json();

        if (!res.ok) {
            console.error("Detalle del error:", data);
            alert("Error: " + (data.error || "Error desconocido"));
            return;
        }

        alert(pinParaEditar ? "¡Actualizado con éxito!" : "¡Publicado con éxito!");
        localStorage.removeItem("pinParaEditar");
        window.location.href = `perfil.html?id=${usuarioLogueado.id}`;
    } catch (err) {
        console.error(err);
        alert("No se pudo conectar con el servidor");
    }
});

