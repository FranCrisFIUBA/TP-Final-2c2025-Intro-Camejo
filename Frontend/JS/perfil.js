// perfil.js - Manejo dinámico del perfil de usuario

// Función para obtener parámetros de la URL
function obtenerParametroURL(nombre) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(nombre);
}

// Función para cargar datos del usuario
async function cargarPerfilUsuario() {
    const usuarioId = obtenerParametroURL('usuario');
    
    console.log('🔍 ID de usuario desde URL:', usuarioId); // Debug
    
    if (!usuarioId) {
        console.error('No se proporcionó ID de usuario en la URL');
        mostrarError('Usuario no encontrado');
        return;
    }

    try {
        // Cargar el JSON de cards
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar data.json');
        }
        const data = await response.json();
        
        console.log('📊 Total de cards cargadas:', data.cards.length); // Debug
        
        // Buscar el usuario por ID (convertir a número para comparar)
        const usuario = data.cards.find(card => 
            card.id.toString() === usuarioId.toString()
        );

        console.log('👤 Usuario encontrado:', usuario); // Debug

        if (usuario) {
            mostrarDatosUsuario(usuario);
            calcularEstadisticas(usuario.id, data.cards); // Pasar ID en lugar de nombre
        } else {
            mostrarError('Usuario no encontrado');
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarError('Error al cargar el perfil: ' + error.message);
    }
}

// Función para mostrar datos del usuario
function mostrarDatosUsuario(usuario) {
    console.log('🎨 Mostrando datos para:', usuario); // Debug
    
    // Actualizar título de la página
    document.getElementById('page-title').textContent = `Perfil de ${usuario.authorName}`;
    
    // Actualizar imagen de perfil
    const profileImage = document.getElementById('profile-image');
    profileImage.src = usuario.authorAvatar;
    profileImage.alt = `Foto de ${usuario.authorName}`;
    
    // Actualizar nombre
    document.getElementById('profile-name').textContent = usuario.authorName;
    
    // Actualizar fecha (si existe)
    const fechaElement = document.getElementById('profile-date');
    if (usuario.publishDate) {
        fechaElement.textContent = `Miembro desde ${formatearFecha(usuario.publishDate)}`;
    } else {
        fechaElement.textContent = 'Miembro desde 2024';
    }
}

// Función para calcular estadísticas (ahora por ID)
function calcularEstadisticas(usuarioId, cards) {
    // Filtrar cards del usuario por ID
    const cardsUsuario = cards.filter(card => card.id === usuarioId);
    
    console.log('📈 Cards del usuario:', cardsUsuario); // Debug
    
    // Calcular estadísticas
    const totalLikes = cardsUsuario.reduce((sum, card) => sum + (card.likes || 0), 0);
    const totalTableros = new Set(cardsUsuario.map(card => card.category || 'General')).size;
    
    console.log('🧮 Estadísticas:', { totalLikes, totalTableros, totalCards: cardsUsuario.length }); // Debug
    
    // Actualizar estadísticas en la UI
    document.getElementById('estadistica-likes').textContent = formatearNumero(totalLikes);
    document.getElementById('estadistica-tableros').textContent = totalTableros;
    document.getElementById('estadistica-busquedas').textContent = cardsUsuario.length;
    
    // Cargar tableros del usuario
    cargarTablerosUsuario(cardsUsuario);
}

// Función para cargar tableros del usuario
function cargarTablerosUsuario(cardsUsuario) {
    const tablerosContainer = document.getElementById('tableros-container');
    
    if (cardsUsuario.length === 0) {
        tablerosContainer.innerHTML = '<p class="no-tableros">Este usuario aún no tiene pins</p>';
        return;
    }
    
    // Agrupar cards por categoría
    const categorias = {};
    cardsUsuario.forEach(card => {
        const categoria = card.category || 'General';
        if (!categorias[categoria]) {
            categorias[categoria] = [];
        }
        categorias[categoria].push(card);
    });
    
    console.log('📂 Categorías encontradas:', Object.keys(categorias)); // Debug
    
    // Generar HTML de tableros
    tablerosContainer.innerHTML = Object.entries(categorias).map(([categoria, cards]) => `
        <div class="tablero-item">
            <div class="tablero-header">
                <h3 class="tablero-title">${categoria}</h3>
                <span class="tablero-count">${cards.length} pins</span>
            </div>
            <div class="tablero-preview">
                ${cards.slice(0, 3).map(card => `
                    <img src="${card.image}" alt="${card.title || 'Pin'}" class="tablero-preview-img" 
                         onerror="this.src='./img/placeholder.jpg'">
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Funciones utilitarias
function formatearFecha(fechaString) {
    try {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
        });
    } catch (error) {
        return '2024';
    }
}

function formatearNumero(numero) {
    if (numero >= 1000) {
        return (numero / 1000).toFixed(1) + 'K';
    }
    return numero.toString();
}

function mostrarError(mensaje) {
    document.getElementById('profile-name').textContent = mensaje;
    document.getElementById('profile-image').src = './img/avatar-default.jpg';
    document.getElementById('estadistica-likes').textContent = '0';
    document.getElementById('estadistica-tableros').textContent = '0';
    document.getElementById('estadistica-busquedas').textContent = '0';
}

// Función para manejar la navegación entre pestañas
function configurarNavegacion() {
    document.querySelectorAll('.nav-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.nav-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            if (this.textContent === 'Tableros') {
                document.querySelector('.tableros-content').style.display = 'block';
                document.querySelector('.searches-content').style.display = 'none';
            } else {
                document.querySelector('.tableros-content').style.display = 'none';
                document.querySelector('.searches-content').style.display = 'block';
            }
        });
    });
}

// Inicializar cuando la página cargue
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando carga de perfil...'); // Debug
    cargarPerfilUsuario();
    configurarNavegacion();
});