let html5QrCode = null;

async function initQrScanner(onSuccessCallback) {
  const readerElement = document.getElementById("reader");
  if (!readerElement) return;

  // Si ya hay un escáner inicializado, lo detenemos limpiamente primero
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (e) {
      // Ignorar si no estaba activo
    }
  }

  // Asegurar que el contenedor esté limpio
  readerElement.innerHTML = "";

  html5QrCode = new Html5Qrcode("reader");

  const config = {
    fps: 10,
    qrbox: { width: 220, height: 220 }
  };

  // Intentar iniciar con la cámara trasera
  html5QrCode.start(
    { facingMode: "environment" },
    config,
    (decodedText) => {
      if (onSuccessCallback && typeof onSuccessCallback === "function") {
        onSuccessCallback(decodedText);
      }
    },
    (errorMessage) => {
      // Escaneo en proceso...
    }
  ).catch(async (err) => {
    console.warn("Fallo cámara trasera, buscando cámaras del dispositivo...", err);
    
    // Si falla 'environment', buscamos directamente en la lista de cámaras
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        // Usa la primera cámara encontrada
        await html5QrCode.start(
          devices[0].id,
          config,
          (decodedText) => {
            if (onSuccessCallback && typeof onSuccessCallback === "function") {
              onSuccessCallback(decodedText);
            }
          },
          (errorMessage) => {}
        );
      } else {
        readerElement.innerHTML = "<p style='color:white; text-align:center; padding:20px;'>No se detectó ninguna cámara disponible.</p>";
      }
    } catch (fallbackErr) {
      console.error("Error al acceder a la cámara:", fallbackErr);
      readerElement.innerHTML = "<p style='color:white; text-align:center; padding:20px;'>Por favor concede permisos de cámara y recarga la página.</p>";
    }
  });
}