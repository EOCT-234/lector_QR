let html5QrcodeScanner = null;

/**
 * Inicializa el escáner de códigos QR usando la cámara del dispositivo.
 * @param {Function} onSuccessCallback - Función que se ejecuta al detectar exitosamente un QR.
 */
function initQrScanner(onSuccessCallback) {
  // Crear la instancia del escáner en el contenedor con id "reader"
  html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,                           // Cuadros por segundo para el escaneo
      qrbox: { width: 250, height: 250 } // Tamaño de la caja de enfoque visual
    },
    /* verbose= */ false
  );

  // Renderizar e iniciar la lectura de la cámara
  html5QrcodeScanner.render(
    (decodedText, decodedResult) => {
      // Llamar a la función callback (definida en main.js) pasando el texto del QR
      onSuccessCallback(decodedText);
    },
    (errorMessage) => {
      // Errores Cuadro a Cuadro (por ejemplo, cuando no hay un QR en cuadro).
      // Se dejan vacíos para no saturar la consola.
    }
  );
}