// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const switchCameraBtn = document.getElementById('switchCameraBtn'); // NUEVO: Botón de cambio de cámara
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const thumbnailGallery = document.getElementById('thumbnailGallery'); // NUEVO: Contenedor de miniaturas
const clearGalleryBtn = document.getElementById('clearGalleryBtn'); // NUEVO: Botón de limpiar

let stream = null;
let facingMode = 'environment'; // NUEVO: Estado actual: 'environment' (trasera) o 'user' (frontal)
let photoUrls = []; // NUEVO: Array para guardar las URLs temporales (Base64)

/**
 * Función central para abrir la cámara con un modo específico.
 * @param {string} mode - 'environment' o 'user'.
 */
async function openCamera(mode = facingMode) {
    // Si la cámara ya está abierta, la cerramos antes de reabrir
    if (stream) {
        closeCamera(false); // Cierra pero no reinicia la UI de apertura
    }

    // Actualiza el modo actual
    facingMode = mode; 
    
    try {
        // 1. Definición de Restricciones (Constraints)
        const constraints = {
            video: {
                facingMode: { ideal: facingMode }, // Usa el modo actual
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        };

        // 2. Obtener el Stream de Medios
        stream = await navigator.mediaDevices.getUserMedia(constraints);

        // 3. Asignar el Stream al Elemento <video>
        video.srcObject = stream;

        // 4. Actualización de la UI
        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        switchCameraBtn.style.display = 'inline-block'; // Asegura que el botón esté visible

        console.log(`Cámara abierta exitosamente. Modo: ${facingMode}`);
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert(`No se pudo acceder a la cámara (${facingMode}). Asegúrate de dar permisos.`);
    }
}

// NUEVO: Función para cambiar entre cámaras (frontal/trasera)
function switchCamera() {
    // Alternar el modo
    const newMode = (facingMode === 'environment') ? 'user' : 'environment';
    console.log(`Cambiando de cámara a: ${newMode}`);
    openCamera(newMode); // Reabrir la cámara con el nuevo modo
}

// Función para tomar la foto
function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // 1. Dibujar el Frame de Video en el Canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 2. Conversión a Data URL (Base64)
    const imageDataURL = canvas.toDataURL('image/png');

    // 3. NUEVO: Almacenamiento temporal y visualización
    photoUrls.push(imageDataURL); // Guardar la URL en el arreglo
    renderGallery(); // Actualizar la galería

    // 4. Cierre de la Cámara
    closeCamera();
    
    console.log('Foto capturada y URL Base64 generada:', imageDataURL.length, 'caracteres');
}

/**
 * Función para cerrar la cámara y actualizar la UI.
 * @param {boolean} updateUi - Si se debe actualizar la UI del botón 'Abrir Cámara'.
 */
function closeCamera(updateUi = true) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;

        // Limpiar y ocultar UI de la cámara
        video.srcObject = null;
        cameraContainer.style.display = 'none';
        
        if (updateUi) {
            // Restaurar el botón 'Abrir Cámara'
            openCameraBtn.textContent = 'Abrir Cámara';
            openCameraBtn.disabled = false;
        }
        
        console.log('Cámara cerrada');
    }
}

// NUEVO: Función para dibujar las miniaturas en la galería
function renderGallery() {
    thumbnailGallery.innerHTML = ''; // Limpiar galería

    if (photoUrls.length === 0) {
        thumbnailGallery.innerHTML = '<p id="noPhotosMessage">Aún no hay fotos capturadas.</p>';
        clearGalleryBtn.disabled = true;
        return;
    }

    clearGalleryBtn.disabled = false;
    
    // Crear un elemento <img> por cada URL Base64
    photoUrls.forEach((url, index) => {
        const img = document.createElement('img');
        img.src = url;
        img.className = 'thumbnail';
        img.alt = `Foto capturada ${index + 1}`;
        thumbnailGallery.appendChild(img);
    });
}

// NUEVO: Función para limpiar la galería
function clearGallery() {
    if (confirm('¿Estás seguro de que quieres borrar todas las fotos de la galería temporal?')) {
        photoUrls = []; // Vaciar el arreglo
        renderGallery(); // Redibujar la galería vacía
        console.log('Galería temporal limpiada.');
    }
}

// Event listeners para la interacción del usuario
openCameraBtn.addEventListener('click', () => openCamera());
takePhotoBtn.addEventListener('click', takePhoto);
switchCameraBtn.addEventListener('click', switchCamera); // NUEVO
clearGalleryBtn.addEventListener('click', clearGallery); // NUEVO

// Inicializar la galería al cargar
document.addEventListener('DOMContentLoaded', renderGallery);

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener('beforeunload', () => {
    closeCamera();
});