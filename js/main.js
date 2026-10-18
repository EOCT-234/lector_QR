// Variable global para evitar lecturas duplicadas consecutivas del QR
let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Limpiar campos de URL al iniciar para evitar mantener textos de sesiones anteriores
  const urlInput = document.getElementById("sheet-url-input");
  if (urlInput) urlInput.value = "";

  // 2. Inicializar escáner QR
  if (typeof initQrScanner === "function") {
    initQrScanner(handleQrScanned);
  }

  // 3. Configurar navegación entre pestañas (Lector QR / Google Sheets)
  initTabs();

  // 4. Asignación de eventos a los botones principales
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) copyBtn.addEventListener("click", copyToClipboard);

  const btnCargar = document.getElementById("btn-cargar");
  if (btnCargar) btnCargar.addEventListener("click", handleCargarVariables);

  // El botón GUARDAR abre la ventana modal de confirmación
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
 * Detiene o reactiva la cámara según la pestaña visible
 */
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Desactivar todas las pestañas y ocultar contenidos
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((content) => {
        content.classList.remove("active");
        content.classList.add("hidden");
      });

      // Activar la pestaña seleccionada
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);

      if (targetContent) {
        targetContent.classList.remove("hidden");
        targetContent.classList.add("active");
      }

      // Gestión eficiente de la cámara según la pestaña
      if (targetId === "qr-tab") {
        if (typeof initQrScanner === "function") {
          initQrScanner(handleQrScanned);
        }
      } else {
        if (typeof stopQrScanner === "function") {
          stopQrScanner();
        }
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

  if (statusCarga) statusCarga.textContent = "Cargando variables...";

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
 * Recibe el resultado de la lectura del escáner QR
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

  // Previene múltiples escaneos continuos en un intervalo muy corto
  setTimeout(() => {
    isProcessing = false;
  }, 2500);
}

/**
 * Copia el valor del texto escaneado al portapapeles
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
      // Fallback para navegadores antiguos
      qrResultText.select();
      document.execCommand("copy");
      if (copyBtn) copyBtn.textContent = "¡COPIADO!";
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = "COPIAR TEXTO";
      }, 2000);
    });
}

/**
 * Abre la ventana modal para solicitar o verificar la URL de Google Sheets
 */
function abrirModalUrl() {
  const modal = document.getElementById("modal-url");
  const modalInput = document.getElementById("modal-url-input");
  
  // Precarga en la modal el enlace ingresado en el campo principal si existe
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
 * Procesa el envío de datos desde la ventana modal:
 * Registra únicamente Accesión, Variable, Repetición y Medición
 */
async function confirmarGuardadoConUrl() {
  const modalInput = document.getElementById("modal-url-input");
  const statusCarga = document.getElementById("status-carga");
  const mainUrlInput = document.getElementById("sheet-url-input");

  const sheetUrlFinal = modalInput ? modalInput.value.trim() : "";

  // Captura exacta de los 4 datos de la evaluación
  const accesion = document.getElementById("accesion-input")?.value.trim() || "";
  const variable = document.getElementById("select-variable")?.value.trim() || "";
  const repeticion = document.getElementById("val-repeticion")?.value.trim() || "";
  const medicion = document.getElementById("val-medicion")?.value.trim() || "";

  cerrarModalUrl();

  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) {
    btnGuardar.disabled = true;
    btnGuardar.textContent = "GUARDANDO...";
  }
  if (statusCarga) statusCarga.textContent = "Procesando...";

  try {
    const response = await saveRecordToSheets({
      sheetUrl: sheetUrlFinal,
      accesion: accesion,
      variable: variable,
      repeticion: repeticion,
      medicion: medicion
    });

    // Si se clonó la plantilla, estampa la nueva URL en el campo principal
    if (response && response.sheetUrl && mainUrlInput) {
      mainUrlInput.value = response.sheetUrl;
    }

    if (statusCarga) statusCarga.textContent = "¡Registro guardado con éxito!";
    
  } catch (error) {
    console.error("Error al guardar:", error);
    if (statusCarga) statusCarga.textContent = "Error al guardar los datos";
    alert("Error: " + (error.message || error));
  } finally {
    if (btnGuardar) {
      btnGuardar.disabled = false;
      btnGuardar.textContent = "GUARDAR";
    }
  }
}