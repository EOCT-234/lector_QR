let html5QrcodeScanner = null;

/**
 * Inicializa el escáner de códigos QR usando la cámara del dispositivo.
 * @param {Function} onSuccessCallback - Función que se ejecuta al detectar un QR.
 */
function initQrScanner(onSuccessCallback) {
  // Crear la instancia del lector en el contenedor con id "reader"
  html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: { width: 180, height: 180 } // Tamaño visual ajustado al nuevo diseño compacto
    },
    /* verbose= */ false
  );

  // Renderizar la cámara y escuchar detecciones
  html5QrcodeScanner.render(
    (decodedText, decodedResult) => {
      // Envía el texto escaneado a main.js
      if (typeof onSuccessCallback === "function") {
        onSuccessCallback(decodedText);
      }
    },
    (errorMessage) => {
      // Se ignoran los errores fotograma a fotograma cuando no detecta un QR
    }
  );
}