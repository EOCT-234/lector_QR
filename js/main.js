let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // Inicializar escáner
  initQrScanner(handleQrScanned);

  // Inicializar pestañas
  initTabs();

  // Asignar evento al botón de copiar
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyToClipboard);
  }
});

/**
 * Lógica para cambiar entre las pestañas "Lector QR" y "Google Sheets"
 */
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Quitar clase activa de todas las pestañas
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((content) => content.classList.add("hidden"));

      // Activar la pestaña seleccionada
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);
      
      if (targetContent) {
        targetContent.classList.remove("hidden");
      }
    });
  });
}

function handleQrScanned(qrText) {
  if (isProcessing) return;
  isProcessing = true;

  const qrResultText = document.getElementById("qr-result-text");
  const copyBtn = document.getElementById("copy-btn");
  const syncStatusEl = document.getElementById("sync-status");

  if (qrResultText) {
    qrResultText.value = qrText;
  }

  if (copyBtn) {
    copyBtn.textContent = "COPIAR TEXTO";
  }

  // Si existe función de sincronización con Sheets
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