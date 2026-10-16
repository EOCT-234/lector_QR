let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar lector QR
  initQrScanner(handleQrScanned);

  // Asignar evento al botón de copiar
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyToClipboard);
  }
});

async function handleQrScanned(qrText) {
  if (isProcessing) return;
  isProcessing = true;

  const statusCard = document.getElementById("status-card");
  const qrResultText = document.getElementById("qr-result-text");
  const syncStatusEl = document.getElementById("sync-status");
  const copyBtn = document.getElementById("copy-btn");

  // Mostrar el panel y el texto leído
  statusCard.classList.remove("hidden");
  qrResultText.value = qrText;
  copyBtn.textContent = "Copiar Texto";

  // Evaluar si Google Sheets está configurado
  if (typeof isGoogleSheetsConfigured === "function" && isGoogleSheetsConfigured()) {
    syncStatusEl.style.display = "block";
    syncStatusEl.className = "status-msg sending";
    syncStatusEl.textContent = "Guardando en Google Sheets...";

    const success = await sendToGoogleSheets(qrText);

    if (success) {
      syncStatusEl.className = "status-msg success";
      syncStatusEl.textContent = "¡Registrado con éxito en Google Sheets!";
    } else {
      syncStatusEl.className = "status-msg error";
      syncStatusEl.textContent = "Error al guardar los datos en Sheets.";
    }
  } else {
    // Si no hay enlace configurado, se oculta completamente ese mensaje
    syncStatusEl.style.display = "none";
    syncStatusEl.textContent = "";
  }

  // Pausa de 3 segundos para evitar múltiples lecturas continuas
  setTimeout(() => {
    isProcessing = false;
  }, 3000);
}

function copyToClipboard() {
  const qrResultText = document.getElementById("qr-result-text");
  const copyBtn = document.getElementById("copy-btn");

  if (!qrResultText.value) return;

  navigator.clipboard.writeText(qrResultText.value)
    .then(() => {
      copyBtn.textContent = "¡Copiado!";
      setTimeout(() => {
        copyBtn.textContent = "Copiar Texto";
      }, 2000);
    })
    .catch(() => {
      qrResultText.select();
      document.execCommand('copy');
      copyBtn.textContent = "¡Copiado!";
      setTimeout(() => {
        copyBtn.textContent = "Copiar Texto";
      }, 2000);
    });
}