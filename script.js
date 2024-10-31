let stream = null;
const video = document.getElementById('camera-preview');
const statusDiv = document.querySelector('.permission-status');

async function checkAndRequestPermissions() {
    try {
        // Verificar soporte del navegador
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Tu navegador no soporta el acceso a la cámara');
        }

        // Verificar permisos existentes
        const result = await navigator.permissions.query({ name: 'camera' });
        
        if (result.state === 'denied') {
            throw new Error('Los permisos de cámara están bloqueados. Por favor, habilítalos en la configuración de tu navegador.');
        }

        // Solicitar acceso a la cámara
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Usar cámara trasera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        return stream;

    } catch (error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            showError('Por favor, permite el acceso a la cámara para usar esta función.');
        } else {
            showError(`Error al acceder a la cámara: ${error.message}`);
        }
        throw error;
    }
}

async function startCamera() {
    try {
        statusDiv.textContent = 'Solicitando acceso a la cámara...';
        stream = await checkAndRequestPermissions();
        
        video.srcObject = stream;
        video.style.display = 'block';
        statusDiv.textContent = 'Cámara activada';
        statusDiv.style.color = '#28a745';
    } catch (error) {
        console.error('Error al iniciar la cámara:', error);
        statusDiv.textContent = 'Error al acceder a la cámara';
        statusDiv.style.color = '#dc3545';
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.querySelector('.camera-section').appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Limpiar recursos cuando se cierra la página
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});