let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Limpiar el campo de enlace al iniciar
  const urlInput = document.getElementById("sheet-url-input");
  if (urlInput) {
    urlInput.value = "";
  }

  // 2. Inicializar escáner QR
  if (typeof initQrScanner === "function") {
    initQrScanner(handleQrScanned);
  }

  // 3. Navegación entre pestañas
  initTabs();

  // 4. Evento para copiar texto del QR
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", copyToClipboard);
  }

  // 5. Evento para botón CARGAR (Variables)
  const btnCargar = document.getElementById("btn-cargar");
  if (btnCargar) {
    btnCargar.addEventListener("click", handleCargarVariables);
  }

  // 6. Evento para botón GUARDAR (Solicita enlace emergente y crea la hoja 'registro')
  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) {
    btnGuardar.addEventListener("click", handleGuardarDatos);
  }
});

function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((content) => {
        content.classList.remove("active");
        content.classList.add("hidden");
      });

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);

      if (targetContent) {
        targetContent.classList.remove("hidden");
        targetContent.classList.add("active");
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
    if (statusCarga) statusCarga.textContent = "Ingresa enlace de Sheets";
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

    if (statusCarga) statusCarga.textContent = "¡Carga exitosa!";

  } catch (error) {
    console.error("Error al cargar variables:", error);
    if (statusCarga) {
      statusCarga.textContent = typeof error === "string" ? error : (error.message || "Error al cargar");
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
      if (copyBtn) copyBtn.textContent = "¡COPIADO!";
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = "COPIAR TEXTO";
      }, 2000);
    })
    .catch(() => {
      qrResultText.select();
      document.execCommand("copy");
      if (copyBtn) copyBtn.textContent = "¡COPIADO!";
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = "COPIAR TEXTO";
      }, 2000);
    });
}

/**
 * Solicita el enlace mediante ventana emergente y crea la hoja 'registro'
 */
async function handleGuardarDatos() {
  const statusCarga = document.getElementById("status-carga");

  // Ventana emergente para pedir el enlace del libro de destino
  const inputUrl = prompt("Ingresa el enlace de Google Sheets donde deseas guardar:");

  if (!inputUrl || inputUrl.trim() === "") {
    alert("Operación cancelada. Se requiere un enlace de Google Sheets.");
    return;
  }

  const sheetUrlFinal = inputUrl.trim();

  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.textContent = "GUARDANDO...";
  }
  if (statusCarga) statusCarga.textContent = "Creando hoja 'registro'...";

  try {
    await saveRecordToSheets({ sheetUrl: sheetUrlFinal });

    if (statusCarga) statusCarga.textContent = "¡Hoja 'registro' lista!";
    alert("Proceso ejecutado. Revisa si se creó la pestaña 'registro' en tu Google Sheets.");

  } catch (error) {
    console.error("Error al guardar:", error);
    if (statusCarga) statusCarga.textContent = "Error al guardar";
    alert("Error: " + (error.message || error));
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "GUARDAR";
    }
  }
}
