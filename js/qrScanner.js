let html5QrcodeScanner = null;

function initQrScanner(onSuccessCallback) {
  html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    {
      fps: 10,
      qrbox: { width: 180, height: 180 } // Cuadro adaptado a la columna compacta
    },
    /* verbose= */ false
  );

  html5QrcodeScanner.render(
    (decodedText) => {
      onSuccessCallback(decodedText);
    },
    (errorMessage) => {}
  );
}