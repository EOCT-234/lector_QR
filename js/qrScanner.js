let html5QrcodeScanner = null;

/**
 * Inicializa el escáner de códigos QR usando la librería html5-qrcode.
 * @param {Function} onSuccessCallback - Función que se ejecuta cuando se lee un código QR.
 */
function initQrScanner(onSuccessCallback) {
  // Crear la instancia del lector en el elemento con id="reader"
  html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: { width: 180, height: 180 } // Caja de enfoque compacta ajustada a la columna izquierda
    },
    /* verbose= */ false
  );

  // Iniciar la cámara y escuchar detecciones
  html5QrcodeScanner.render(
    function(decodedText) {
      // Envía el texto detectado a la función de callback (handleQrScanned en main.js)
      if (typeof onSuccessCallback === "function") {
        onSuccessCallback(decodedText);
      }
    },
    function(errorMessage) {
      // Errores Cuadro a Cuadro cuando no hay un QR frente a la cámara (se ignoran)
    }
  );
}