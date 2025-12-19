const API_BASE_URL = 'http://127.0.0.1:3000';

function obtenerUsuarioId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); 
    
}


async function cargarPerfilUsuario() {
    const usuarioId = obtenerUsuarioId();
    
    if (!usuarioId) {
        console.error('No se proporcionó ID de usuario');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${usuarioId}`);
        
        if (!response.ok) throw new Error('Usuario no encontrado en la base de datos');
        
        const usuario = await response.json();
        
        mostrarDatosUsuario(usuario);
        cargarPublicacionesDeUsuario(usuarioId);

    } catch (error) {
        console.error('Error:', error);
        const container = document.querySelector('.profile-container');
        if (container) container.innerHTML = `<h2>Error: ${error.message}</h2>`;
    }
}


function actualizarInterfazUsuario(usuario) {
    const nombreElem = document.getElementById('user-name');
    const iconoElem = document.getElementById('user-avatar');
    const bioElem = document.getElementById('user-bio');

    if (nombreElem) nombreElem.textContent = usuario.nombre;
    if (iconoElem) iconoElem.src = usuario.icono || './img/avatar-default.jpg';
    if (bioElem) bioElem.textContent = usuario.fecha_registro;
}


async function cargarPublicacionesDeUsuario(usuarioId) {
    const publicacionesContainer = document.getElementById('publicaciones-container');
    if (!publicacionesContainer) return;

    try {
        console.log(`Intentando cargar publicaciones para el ID: ${usuarioId}`);
        const response = await fetch(`${API_BASE_URL}/publicaciones/usuario/${usuarioId}`);
        
        if (!response.ok) {
            const errorTexto = await response.text(); 
            throw new Error(`Error ${response.status}: ${errorTexto}`);
        }
        
        const publicaciones = await response.json();
        console.log("Publicaciones recibidas:", publicaciones);

        // 1. Manejo de caso sin publicaciones
        if (!publicaciones || publicaciones.length === 0) {
            publicacionesContainer.innerHTML = `
                <div class="no-content">
                    <i class="fa-solid fa-images" style="font-size: 48px; margin-bottom: 20px; color: #ccc;"></i>
                    <p>Este usuario aún no tiene publicaciones</p>
                </div>
            `;
            return;
        }

        // 2. Renderizado de las cards
        const html = publicaciones.map(p => {
            // Convertimos el objeto a string para pasarlo al modal de forma segura
            const publicacionJSON = JSON.stringify(p).replace(/'/g, "&apos;");

            return `
            <div class="publicacion-item" data-publicacion-id="${p.id}">
                <div class="publicacion-header">
                    <h3 class="publicacion-title">${p.titulo || 'Sin título'}</h3>
                    <span class="publicacion-likes">
                        <i class="fas fa-heart"></i> ${p.likes || 0}
                    </span>
                </div>
                <div class="publicacion-preview">
                    <img src="${p.url_imagen || './img/placeholder.jpg'}" 
                         alt="${p.titulo}" 
                         class="publicacion-image" 
                         onerror="this.src='./img/placeholder.jpg'"
                         onclick='abrirCardModal(${publicacionJSON})'>
                </div>
                <div class="publicacion-info">
                    <div class="publicacion-hashtags">
                        ${listarHashtags(p.etiquetas)}
                    </div>
                    <p class="publicacion-fecha">
                        <i class="fa-regular fa-calendar"></i> ${calcularFecha(p.fecha_publicacion)}
                    </p>
                </div>
            </div>
            `;
        }).join('');

        publicacionesContainer.innerHTML = html;

    } catch (error) {
        console.error('Error detallado:', error);
        publicacionesContainer.innerHTML = `<p class="error-msg">Error: No se pudieron cargar las publicaciones.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', cargarPerfilUsuario);



function listarHashtags(etiquetas) {
    if (!etiquetas) return '';
    return etiquetas.split(',')
        .map(tag => `<span class="hashtag">#${tag.trim()}</span>`)
        .join('');
}

function calcularFecha(fechaInput) {
    const fechaPublicacion = new Date(fechaInput);
    const ahora = new Date();
    const diferenciaEnSegundos = Math.floor((ahora - fechaPublicacion) / 1000);

    // Definimos los intervalos en segundos
    const intervalos = {
        año: 31536000,
        mes: 2592000,
        día: 86400,
        hora: 3600,
        minuto: 60
    };

    let unidad = Math.floor(diferenciaEnSegundos / intervalos.año);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 año" : `hace ${unidad} años`;
    }
    unidad = Math.floor(diferenciaEnSegundos / intervalos.mes);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 mes" : `hace ${unidad} meses`;
    }
    unidad = Math.floor(diferenciaEnSegundos / intervalos.día);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 día" : `hace ${unidad} días`;
    }
    unidad = Math.floor(diferenciaEnSegundos / intervalos.hora);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 hora" : `hace ${unidad} horas`;
    }
    unidad = Math.floor(diferenciaEnSegundos / intervalos.minuto);
    if (unidad >= 1) {
        return unidad === 1 ? "hace 1 minuto" : `hace ${unidad} minutos`;
    }

    return "hace un momento";
}









// Función para abrir modal de publicación
function abrirPublicacionModal(publicacionId) {
    console.log('Abrir publicación:', publicacionId);
    // Por ahora, redirigir a la vista principal
    window.location.href = '/';
}

// Función para mostrar datos del usuario CON VERIFICACIÓN
function mostrarDatosUsuario(usuario) {
    console.log('Mostrando datos para:', usuario);
    
    try {
        
        // Actualizar imagen de perfil
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            profileImage.src = usuario.icono;
            profileImage.alt = `Foto de ${usuario.nombre}`;
            profileImage.onerror = function() {
                this.src = './img/avatar-default.jpg';
            };
        }
        
        // Actualizar nombre
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = usuario.nombre;
        }
        
        // Actualizar fecha
        const fechaElement = document.getElementById('profile-date');
        if (fechaElement) {
            if (usuario.fecha_registro) {
                fechaElement.textContent = `Miembro desde ${formatearFecha(usuario.fecha_registro)}`;
            } else {
                fechaElement.textContent = 'Miembro desde 2024';
            }
        }
        
    } catch (error) {
        console.error('Error en mostrarDatosUsuario:', error);
    }
}


// Funciones utilitarias
function formatearFecha(fechaString) {
    try {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return '2024';
    }
}

function formatearNumero(numero) {
    if (numero >= 1000000) {
        return (numero / 1000000).toFixed(1) + 'M';
    }
    if (numero >= 1000) {
        return (numero / 1000).toFixed(1) + 'K';
    }
    return numero.toString();
}

function mostrarError(mensaje) {
    try {
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = mensaje;
        }
        
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            profileImage.src = './img/avatar-default.jpg';
        }
        const elementos = ['estadistica-likes', 'estadistica-tableros', 'estadistica-busquedas'];
        elementos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = '0';
            }
        });
    } catch (error) {
        console.error('Error en mostrarError:', error);
    }
}

// Función para manejar la navegación entre pestañas
function configurarNavegacion() {
    const usuarioId = obtenerUsuarioId();
    
    document.querySelectorAll('.nav-option').forEach(option => {
        option.addEventListener('click', async function() { 
            document.querySelectorAll('.nav-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            document.querySelector('.publicaciones-content').style.display = 'none';
            document.querySelector('.tableros-content').style.display = 'none';
            document.querySelector('.searches-content').style.display = 'none';
            const opcionSeleccionada = this.textContent.trim();
            switch(opcionSeleccionada) {
                case 'Publicaciones': 
                    document.querySelector('.publicaciones-content').style.display = 'block';
                    if (usuarioId) {
                        await cargarPublicacionesDeUsuarioAPI(usuarioId);
                    }
                    break;
                    
                case 'Tableros':
                    document.querySelector('.tableros-content').style.display = 'block';
                    break;
                    
                case 'Búsquedas personalizadas':
                    document.querySelector('.searches-content').style.display = 'block';
                    break;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando carga de perfil...');
    console.log('Verificando elementos del DOM:');
    console.log('- estadistica-likes:', document.getElementById('estadistica-likes'));
    console.log('- estadistica-tableros:', document.getElementById('estadistica-tableros'));
    console.log('- estadistica-busquedas:', document.getElementById('estadistica-busquedas'));
    console.log('- publicaciones-container:', document.getElementById('publicaciones-container'));
    console.log('- tableros-container:', document.getElementById('tableros-container'));
    
    setTimeout(() => {
        cargarPerfilUsuario();
        configurarNavegacion();
    }, 100);
});