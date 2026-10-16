// Variable para evitar lecturas duplicadas seguidas
let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializar el lector QR usando la función de qrScanner.js
  initQrScanner(handleQrScanned);

  // 2. Asignar evento al botón de copiar
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyToClipboard);
  }
});

/**
 * Callback que se ejecuta cuando qrScanner.js detecta un código QR
 * @param {string} qrText - El texto extraído del QR
 */
async function handleQrScanned(qrText) {
  if (isProcessing) return;
  isProcessing = true;

  const statusCard = document.getElementById("status-card");
  const qrResultText = document.getElementById("qr-result-text");
  const syncStatusEl = document.getElementById("sync-status");
  const copyBtn = document.getElementById("copy-btn");

  // Mostrar el panel de resultados y el texto del QR
  statusCard.classList.remove("hidden");
  qrResultText.value = qrText;
  copyBtn.textContent = "Copiar Texto";

  // Actualizar estado en pantalla
  syncStatusEl.className = "status-msg sending";
  syncStatusEl.textContent = "Guardando en Google Sheets...";

  // Enviar los datos usando la función definida en sheets.js
  const success = await sendToGoogleSheets(qrText);

  if (success) {
    syncStatusEl.className = "status-msg success";
    syncStatusEl.textContent = "¡Registrado con éxito en Google Sheets!";
  } else {
    syncStatusEl.className = "status-msg error";
    syncStatusEl.textContent = "Error al guardar los datos.";
  }

  // Esperar 3 segundos antes de permitir escanear otro código
  setTimeout(() => {
    isProcessing = false;
  }, 3000);
}

/**
 * Función para copiar el contenido del cuadro de texto al portapapeles
 */
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
      // Método de respaldo para navegadores antiguos
      qrResultText.select();
      document.execCommand('copy');
      copyBtn.textContent = "¡Copiado!";
      setTimeout(() => {
        copyBtn.textContent = "Copiar Texto";
      }, 2000);
    });
}