let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Limpiar campos al iniciar para que la casilla no conserve texto previo
  const urlInput = document.getElementById("sheet-url-input");
  if (urlInput) urlInput.value = "";

  // 2. Inicializar escáner QR
  if (typeof initQrScanner === "function") {
    initQrScanner(handleQrScanned);
  }

  // 3. Navegación entre pestañas (Lector QR / Google Sheets)
  initTabs();

  // 4. Eventos de botones principales
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) copyBtn.addEventListener("click", copyToClipboard);

  const btnCargar = document.getElementById("btn-cargar");
  if (btnCargar) btnCargar.addEventListener("click", handleCargarVariables);

  // El botón GUARDAR abre la ventana modal
  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) btnGuardar.addEventListener("click", abrirModalUrl);

  // Eventos de la ventana modal
  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  if (modalCancelBtn) modalCancelBtn.addEventListener("click", cerrarModalUrl);

  const modalConfirmBtn = document.getElementById("modal-confirm-btn");
  if (modalConfirmBtn) modalConfirmBtn.addEventListener("click", confirmarGuardadoConUrl);
});

/**
 * Control de navegación entre pestañas de la interfaz
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
 * Obtiene la lista de variables desde la pestaña 'descriptores'
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
    console.error("Error al cargar variables:", error);
    if (statusCarga) {
      statusCarga.textContent = typeof error === "string" ? error : (error.message || "Error al cargar");
    }
  }
}

/**
 * Función que recibe el resultado del escáner QR
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
 * Copia el valor del escáner QR al portapapeles
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
 * Abre la ventana modal para solicitar la URL de Google Sheets
 */
function abrirModalUrl() {
  const modal = document.getElementById("modal-url");
  const modalInput = document.getElementById("modal-url-input");
  
  // Si ya se colocó un enlace en el campo principal, lo precarga en la modal
  const mainUrl = document.getElementById("sheet-url-input")?.value.trim();
  if (modalInput) modalInput.value = mainUrl || "";

  if (modal) modal.classList.remove("hidden");
}

/**
 * Cierra la ventana modal
 */
function cerrarModalUrl() {
  const modal = document.getElementById("modal-url");
  if (modal) modal.classList.add("hidden");
}

/**
 * Procesa la solicitud al presionar 'Confirmar y Crear Hoja' dentro de la modal
 */
async function confirmarGuardadoConUrl() {
  const modalInput = document.getElementById("modal-url-input");
  const statusCarga = document.getElementById("status-carga");
  const sheetUrlFinal = modalInput ? modalInput.value.trim() : "";

  if (!sheetUrlFinal) {
    alert("Por favor, ingresa un enlace válido de Google Sheets.");
    return;
  }

  cerrarModalUrl();

  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.textContent = "GUARDANDO...";
  }
  if (statusCarga) statusCarga.textContent = "Enviando solicitud...";

  try {
    await saveRecordToSheets({ sheetUrl: sheetUrlFinal });

    if (statusCarga) statusCarga.textContent = "¡Solicitud enviada!";
    alert("Proceso ejecutado. Revisa tu libro de Google Sheets para verificar si se creó la pestaña 'registro'.");

  } catch (error) {
    console.error("Error al guardar:", error);
    if (statusCarga) statusCarga.textContent = "Error al guardar";
    alert("Error al conectar con Google Sheets: " + (error.message || error));
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "GUARDAR";
    }
  }
}