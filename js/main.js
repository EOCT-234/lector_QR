let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de Lector QR
  if (typeof initQrScanner === "function") {
    initQrScanner(handleQrScanned);
  }

  // Inicialización de Pestañas
  initTabs();

  // Evento Botón Copiar Texto
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
    });
  });
}

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