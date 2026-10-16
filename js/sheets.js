let html5QrCode = null;

function initQrScanner(onSuccessCallback) {
  const readerElement = document.getElementById("reader");
  if (!readerElement) return;

  if (html5QrCode) {
    try {
      html5QrCode.stop();
    } catch (e) {}
  }

  html5QrCode = new Html5Qrcode("reader");

  const config = {
    fps: 10,
    qrbox: { width: 180, height: 180 }
  };

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      if (onSuccessCallback && typeof onSuccessCallback === "function") {
        onSuccessCallback(decodedText);
      }
    },
    (errorMessage) => {}
  ).catch((err) => {
    console.warn("Iniciando con cámara por defecto...", err);
    Html5Qrcode.getCameras().then((devices) => {
      if (devices && devices.length > 0) {
        html5QrCode.start(
          devices[0].id,
          config,
          (decodedText) => {
            if (onSuccessCallback && typeof onSuccessCallback === "function") {
              onSuccessCallback(decodedText);
            }
          },
          (errorMessage) => {}
        );
      }
    }).catch((e) => console.error(e));
  });
}