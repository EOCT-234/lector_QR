let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Limpiar el campo del enlace para que comience vacío al actualizar la página
  const urlInput = document.getElementById("sheet-url-input");
  if (urlInput) {
    urlInput.value = "";
  }

  // 2. Inicialización del Lector QR
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

  // 5. Evento para botón CARGAR (Obtener lista de variables desde Google Apps Script)
  const btnCargar = document.getElementById("btn-cargar");
  if (btnCargar) {
    btnCargar.addEventListener("click", handleCargarVariables);
  }

  // 6. Evento para botón GUARDAR (Enviar registro a Google Sheets)
  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) {
    btnGuardar.addEventListener("click", handleGuardarDatos);
  }
});

/**
 * Control de navegación entre la pestaña Lector QR y Google Sheets
 */
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

/**
 * Obtiene la lista de opciones de la columna 'variable' desde la hoja 'descriptores'
 */
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
    console.error("Detalle del error al cargar variables:", error);
    if (statusCarga) {
      statusCarga.textContent = typeof error === "string" ? error : (error.message || "Error al cargar");
    }
  }
}

/**
 * Callback ejecutado al escanear exitosamente un código QR
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
 * Copia el contenido leído por el escáner al portapapeles
 */
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
 * Recolecta la entrada de campos y envía la información a Google Sheets
 */
async function handleGuardarDatos() {
  const sheetUrl = document.getElementById("sheet-url-input")?.value.trim() || "";
  const accesion = document.getElementById("accesion-input")?.value.trim() || "";
  const variable = document.getElementById("select-variable")?.value || "";
  const repeticion = document.getElementById("val-repeticion")?.value.trim() || "";
  const medicion = document.getElementById("val-medicion")?.value.trim() || "";
  const statusCarga = document.getElementById("status-carga");

  if (!sheetUrl) {
    if (statusCarga) statusCarga.textContent = "Ingresa el enlace de Sheets";
    alert("Ingresa primero el enlace de Google Sheets.");
    return;
  }

  if (!accesion || !variable || !repeticion || !medicion) {
    if (statusCarga) statusCarga.textContent = "Faltan campos";
    alert("Completa todos los campos (Accesión, Variable, Repetición y Medición) antes de guardar.");
    return;
  }

  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.textContent = "GUARDANDO...";
  }
  if (statusCarga) statusCarga.textContent = "Guardando...";

  const payload = {
    sheetUrl: sheetUrl,
    accesion: accesion,
    variable: variable,
    repeticion: repeticion,
    medicion: medicion
  };

  try {
    await saveRecordToSheets(payload);

    if (statusCarga) statusCarga.textContent = "¡Guardado exitoso!";

    // Limpia únicamente Repetición y Medición para agilizar el ingreso continuo
    const repInput = document.getElementById("val-repeticion");
    const medInput = document.getElementById("val-medicion");
    if (repInput) repInput.value = "";
    if (medInput) {
      medInput.value = "";
      medInput.focus();
    }

  } catch (error) {
    console.error("Error al guardar:", error);
    if (statusCarga) statusCarga.textContent = "Error al guardar";
    alert("Error al guardar en Google Sheets: " + (error.message || error));
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "GUARDAR";
    }
  }
}