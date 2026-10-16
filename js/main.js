let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar lector QR
  initQrScanner(handleQrScanned);

  // Evento para el botón de copiar
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyToClipboard);
  }
});

function handleQrScanned(qrText) {
  if (isProcessing) return;
  isProcessing = true;

  const qrResultText = document.getElementById("qr-result-text");
  const copyBtn = document.getElementById("copy-btn");
  const syncStatusEl = document.getElementById("sync-status");

  // Asignar directamente el valor leído al campo de texto
  if (qrResultText) {
    qrResultText.value = qrText;
  }

  if (copyBtn) {
    copyBtn.textContent = "COPIAR TEXTO";
  }

  // Integración con Google Sheets si está configurada
  if (typeof isGoogleSheetsConfigured === "function" && isGoogleSheetsConfigured()) {
    if (syncStatusEl) {
      syncStatusEl.style.display = "block";
      syncStatusEl.className = "status-msg sending";
      syncStatusEl.textContent = "Guardando en Google Sheets...";
    }

    sendToGoogleSheets(qrText).then((success) => {
      if (syncStatusEl) {
        if (success) {
          syncStatusEl.className = "status-msg success";
          syncStatusEl.textContent = "¡Registrado con éxito!";
        } else {
          syncStatusEl.className = "status-msg error";
          syncStatusEl.textContent = "Error al guardar en Sheets.";
        }
      }
    });
  } else if (syncStatusEl) {
    syncStatusEl.style.display = "none";
  }

  // Pausa de 2.5 segundos para evitar lecturas duplicadas
  setTimeout(() => {
    isProcessing = false;
  }, 2500);
}

function copyToClipboard() {
  const qrResultText = document.getElementById("qr-result-text");
  const copyBtn = document.getElementById("copy-btn");

  if (!qrResultText || !qrResultText.value) return;

  navigator.clipboard.writeText(qrResultText.value)
    .then(() => {
      copyBtn.textContent = "¡COPIADO!";
      setTimeout(() => {
        copyBtn.textContent = "COPIAR TEXTO";
      }, 2000);
    })
    .catch(() => {
      qrResultText.select();
      document.execCommand('copy');
      copyBtn.textContent = "¡COPIADO!";
      setTimeout(() => {
        copyBtn.textContent = "COPIAR TEXTO";
      }, 2000);
    });
}