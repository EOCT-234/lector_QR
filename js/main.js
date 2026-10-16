let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // Inicialización del escáner
  startQrScanner();
  
  // Inicialización de Pestañas
  initTabs();

  // Evento Copiar Texto
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyToClipboard);
  }

  // Evento Botón CARGAR en Google Sheets
  const btnCargar = document.getElementById("btn-cargar");
  if (btnCargar) {
    btnCargar.addEventListener("click", handleCargarVariables);
  }
});

/**
 * Función auxiliar para iniciar el escáner de manera segura
 */
function startQrScanner() {
  if (typeof initQrScanner === "function") {
    initQrScanner(handleQrScanned);
  }
}

/**
 * Control de navegación por Pestañas con reinicio automático de cámara
 */
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((content) => content.classList.add("hidden"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);
      
      if (targetContent) {
        targetContent.classList.remove("hidden");
      }

      // Reinicia el escáner de cámara cuando se selecciona la pestaña 'Lector QR'
      if (targetId === "tab-scanner") {
        setTimeout(() => {
          startQrScanner();
        }, 100);
      }
    });
  });
}

/**
 * Procesa la carga de variables desde Apps Script (Versión 6)
 */
async function handleCargarVariables() {
  const urlInput = document.getElementById("sheet-url-input");
  const statusCarga = document.getElementById("status-carga");
  const selectVariable = document.getElementById("select-variable");

  const sheetUrl = urlInput ? urlInput.value.trim() : "";

  if (!sheetUrl) {
    if (statusCarga) statusCarga.textContent = "Ingresa un enlace válido";
    return;
  }

  if (statusCarga) statusCarga.textContent = "Cargando...";

  try {
    const variables = await fetchDescriptorsVariables(sheetUrl);

    if (selectVariable) {
      selectVariable.innerHTML = '<option value="">---------</option>';
      variables.forEach((variable) => {
        const option = document.createElement("option");
        option.value = variable;
        option.textContent = variable;
        selectVariable.appendChild(option);
      });
    }

    if (statusCarga) statusCarga.textContent = "Carga exitosa";

  } catch (error) {
    console.error("Detalle del error:", error);
    if (statusCarga) {
      statusCarga.textContent = typeof error === 'string' ? error : (error.message || "Error al cargar");
    }
  }
}

/**
 * Captura el texto del QR escaneado
 */
function handleQrScanned(qrText) {
  if (isProcessing) return;
  isProcessing = true;

  const qrResultText = document.getElementById("qr-result-text");
  const accesionInput = document.getElementById("accesion-input");
  const copyBtn = document.getElementById("copy-btn");

  if (qrResultText) qrResultText.value = qrText;
  if (accesionInput) accesionInput.value = qrText;
  if (copyBtn) copyBtn.textContent = "COPIAR TEXTO";

  setTimeout(() => {
    isProcessing = false;
  }, 2500);
}

/**
 * Copiar texto al portapapeles
 */
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