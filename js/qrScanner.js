let html5QrCode = null;

/**
 * Inicializa y arranca la cámara dentro del contenedor #qr-reader
 */
async function startQRScanner() {
  const qrReaderDiv = document.getElementById("qr-reader");
  const qrStatus = document.getElementById("qr-status");
  const qrResultInput = document.getElementById("qr-result");

  if (!qrReaderDiv) return;

  // Si ya hay un escáner activo, lo detenemos antes de iniciar uno nuevo
  await stopQRScanner();

  try {
    if (qrStatus) {
      qrStatus.textContent = "Solicitando acceso a la cámara...";
      qrStatus.className = "status-message info";
    }

    html5QrCode = new Html5Qrcode("qr-reader");

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    };

    await html5QrCode.start(
      { facingMode: "environment" }, // Prioriza la cámara trasera en dispositivos móviles
      config,
      (decodedText) => {
        // Al detectar un código QR exitosamente
        if (qrResultInput) {
          qrResultInput.value = decodedText;
        }

        // Transfiere automáticamente la accesión leída al formulario de Google Sheets
        const accesionInput = document.getElementById("accesion-input");
        if (accesionInput) {
          accesionInput.value = decodedText;
        }

        if (qrStatus) {
          qrStatus.textContent = `¡QR Escaneado!: ${decodedText}`;
          qrStatus.className = "status-message success";
        }
      },
      (errorMessage) => {
        // Ignorar errores de escaneo cuadro a cuadro cuando no se detecta QR
      }
    );

    if (qrStatus) {
      qrStatus.textContent = "Cámara activa. Apunta al código QR.";
      qrStatus.className = "status-message success";
    }

  } catch (err) {
    if (qrStatus) {
      qrStatus.textContent = "Error al activar la cámara: " + err;
      qrStatus.className = "status-message error";
    }
  }
}

/**
 * Apaga la cámara para liberar recursos al cambiar de pestaña
 */
async function stopQRScanner() {
  if (html5QrCode && html5QrCode.isScanning) {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
    } catch (e) {
      console.error("Error al detener el escáner QR:", e);
    }
  }
}