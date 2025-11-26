// perfil.js - Manejo dinámico del perfil de usuario con API

// Función para obtener parámetros de la URL
function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Función para cargar datos del usuario
async function cargarPerfilUsuario() {
    const usuarioId = obtenerParametroURL('usuario');
    
    console.log('ID de usuario desde URL:', usuarioId);
    
    if (!usuarioId) {
        console.error('No se proporcionó ID de usuario en la URL');
        mostrarError('Usuario no encontrado');
        return;
    }

    try {
        // Cargar datos desde la API
        const response = await fetch('/api/data');
        if (!response.ok) {
            throw new Error('No se pudo cargar datos de la API');
        }
        const data = await response.json();
        
        // Buscar usuario en data.usuarios
        const usuario = data.usuarios.find(user => 
            user.id.toString() === usuarioId.toString()
        );

        console.log('Usuario encontrado:', usuario);

        if (usuario) {
            mostrarDatosUsuario(usuario);
            cargarMisPublicaciones(usuario.id, data);
        } else {
            mostrarError('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarError('Error al cargar el perfil: ' + error.message);
    }
}

// Función para cargar MIS PUBLICACIONES
function cargarMisPublicaciones(usuarioId, data) {
    const publicacionesContainer = document.getElementById('publicaciones-container');
    
    if (!publicacionesContainer) {
        console.error(' No se encontró el contenedor de publicaciones');
        return;
    }
    
    // Filtrar publicaciones del usuario
    const publicacionesUsuario = data.cards ? data.cards.filter(publicacion => 
        publicacion.id_author && publicacion.id_author.toString() === usuarioId.toString()
    ) : [];
    
    calcularEstadisticas(usuarioId, data);
    
    if (publicacionesUsuario.length === 0) {
        console.log('ℹNo hay publicaciones para este usuario');
        publicacionesContainer.innerHTML = `
            <div class="no-content">
                <i class="fa-solid fa-images" style="font-size: 48px; margin-bottom: 20px; color: #ccc;"></i>
                <p>Este usuario aún no tiene publicaciones</p>
            </div>
        `;
        return;
    }
    
    // Generar HTML de publicaciones
    const html = publicacionesUsuario.map(publicacion => {
        return `
        <div class="publicacion-item" data-publicacion-id="${publicacion.id}">
            <div class="publicacion-header">
                <h3 class="publicacion-title">${publicacion.title || 'Publicación sin título'}</h3>
                <span class="publicacion-likes"><i class="fas fa-heart"></i> ${publicacion.likes || 0}</span>
            </div>
            <div class="publicacion-preview">
                <img src="${publicacion.image}" 
                     alt="${publicacion.title || 'Publicación'}" 
                     class="publicacion-image" 
                     onerror="this.src='./img/placeholder.jpg'"
                     onclick="abrirPublicacionModal(${publicacion.id})">
            </div>
            <div class="publicacion-info">
                <div class="publicacion-hashtags">
                    ${publicacion.hashtags ? publicacion.hashtags.map(tag => 
                        `<span class="hashtag">${tag}</span>`
                    ).join('') : ''}
                </div>
                <p class="publicacion-fecha"><i class="fa-regular fa-calendar"></i> ${formatearFecha(publicacion.publishDate)}</p>
            </div>
        </div>
        `;
    }).join('');
    publicacionesContainer.innerHTML = html;
}

// Función para cargar TABLEROS (para implementar después)
function cargarTablerosUsuario(usuarioId, data) {
    console.log('Cargando TABLEROS para usuario ID:', usuarioId);
    
    const tablerosContainer = document.getElementById('tableros-container');
    
    if (!tablerosContainer) {
        console.error('No se encontró el contenedor de tableros');
        return;
    }
    
    // falta
}

// Función para cargar BÚSQUEDAS PERSONALIZADAS
function cargarBusquedasUsuario(usuarioId, data) {
    console.log('Cargando BÚSQUEDAS para usuario ID:', usuarioId);
    
    const listaBusquedas = document.getElementById('lista-busquedas');
    
    if (!listaBusquedas) {
        console.error('No se encontró el contenedor de búsquedas');
        return;
    }
    
    // falta
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
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = `${usuario.username}`;
        }
        
        // Actualizar imagen de perfil
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            profileImage.src = usuario.avatar;
            profileImage.alt = `Foto de ${usuario.username}`;
            profileImage.onerror = function() {
                this.src = './img/avatar-default.jpg';
            };
        }
        
        // Actualizar nombre
        const profileName = document.getElementById('profile-name');
        if (profileName) {
            profileName.textContent = usuario.username;
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

// Función para calcular estadísticas 
function calcularEstadisticas(usuarioId, data) {
    try {
        const publicacionesUsuario = data.cards ? data.cards.filter(publicacion => 
            publicacion.id_author && publicacion.id_author.toString() === usuarioId.toString()
        ) : [];
        
        const totalLikes = publicacionesUsuario.reduce((sum, publicacion) => sum + (publicacion.likes || 0), 0);
        const busquedasSimuladas = Math.floor(Math.random() * 50) + 5;
        
        console.log('Estadísticas:', { 
            totalLikes, 
            totalPublicaciones: publicacionesUsuario.length,
            busquedas: busquedasSimuladas
        });
        const elementos = {
            likes: document.getElementById('estadistica-likes'),
            tableros: document.getElementById('estadistica-tableros'),
            busquedas: document.getElementById('estadistica-busquedas')
        };
        
        console.log('🔍 Elementos encontrados:', elementos);
        if (elementos.likes) {
            elementos.likes.textContent = formatearNumero(totalLikes);
        } else {
            console.error('No se encontró el elemento estadistica-likes');
        }
        
        if (elementos.tableros) {
            elementos.tableros.textContent = publicacionesUsuario.length;
        } else {
            console.error('No se encontró el elemento estadistica-tableros');
        }
        
        if (elementos.busquedas) {
            elementos.busquedas.textContent = busquedasSimuladas;
        } else {
            console.error('No se encontró el elemento estadistica-busquedas');
        }
        
    } catch (error) {
        console.error('Error en calcularEstadisticas:', error);
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
    document.querySelectorAll('.nav-option').forEach(option => {
        option.addEventListener('click', function() {
            const opcionSeleccionada = this.textContent;
            
            document.querySelectorAll('.nav-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            document.querySelectorAll('.publicaciones-content, .tableros-content, .searches-content').forEach(content => {
                content.style.display = 'none';
            });
            
            switch(opcionSeleccionada) {
                case 'Mis publicaciones':
                    document.querySelector('.publicaciones-content').style.display = 'block';
                    const usuarioId = obtenerParametroURL('usuario');
                    if (usuarioId) {
                        fetch('/api/data')
                            .then(response => response.json())
                            .then(data => cargarMisPublicaciones(usuarioId, data));
                    }
                    break;
                    
                case 'Tableros':
                    document.querySelector('.tableros-content').style.display = 'block';
                    // Cargar tableros
                    const usuarioIdTableros = obtenerParametroURL('usuario');
                    if (usuarioIdTableros) {
                        fetch('/api/data')
                            .then(response => response.json())
                            .then(data => cargarTablerosUsuario(usuarioIdTableros, data));
                    }
                    break;
                    
                case 'Búsquedas personalizadas':
                    document.querySelector('.searches-content').style.display = 'block';
                    // Cargar búsquedas
                    const usuarioIdBusquedas = obtenerParametroURL('usuario');
                    if (usuarioIdBusquedas) {
                        fetch('/api/data')
                            .then(response => response.json())
                            .then(data => cargarBusquedasUsuario(usuarioIdBusquedas, data));
                    }
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