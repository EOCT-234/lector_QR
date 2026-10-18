// Variable global para controlar lecturas duplicadas consecutivas del QR
let isProcessing = false;

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicialización de navegación por pestañas
  initTabs();

  // 2. Inicializar escáner QR
  if (typeof initQrScanner === "function") {
    initQrScanner(handleQrScanned);
  }

  // 3. Evento para el autogrow (auto-ampliación) del textarea de variables
  const textareaVars = document.getElementById("lista-variables-textarea");
  if (textareaVars) {
    textareaVars.addEventListener("input", function() {
      this.style.height = "auto";
      this.style.height = (this.scrollHeight) + "px";
    });
  }

  // 4. Eventos de la pestaña 'Inicio'
  const btnCrearHoja = document.getElementById("btn-crear-hoja");
  if (btnCrearHoja) {
    btnCrearHoja.addEventListener("click", handleCrearHojaInicio);
  }

  const btnAgregarLista = document.getElementById("btn-agregar-variables-lista");
  if (btnAgregarLista) {
    btnAgregarLista.addEventListener("click", handleAgregarListaVariables);
  }

  // 5. Eventos de la pestaña 'Google Sheets'
  const btnCargar = document.getElementById("btn-cargar");
  if (btnCargar) btnCargar.addEventListener("click", handleCargarVariables);

  const btnGuardar = document.getElementById("btn-guardar");
  if (btnGuardar) btnGuardar.addEventListener("click", abrirModalUrl);

  const modalCancelBtn = document.getElementById("modal-cancel-btn");
  if (modalCancelBtn) modalCancelBtn.addEventListener("click", cerrarModalUrl);

  const modalConfirmBtn = document.getElementById("modal-confirm-btn");
  if (modalConfirmBtn) modalConfirmBtn.addEventListener("click", confirmarGuardadoConUrl);

  // 6. Evento del botón Copiar Texto del QR
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) copyBtn.addEventListener("click", copyToClipboard);
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

      // Gestión eficiente de la cámara según la pestaña activa
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
 * Genera la copia de la plantilla al hacer clic en CARGAR / CREAR HOJA DE TRABAJO
 */
async function handleCrearHojaInicio() {
  const statusInicio = document.getElementById("status-inicio");
  const nuevoEnlaceInput = document.getElementById("nuevo-enlace-input");
  const sheetUrlInput = document.getElementById("sheet-url-input");
  const btnCrearHoja = document.getElementById("btn-crear-hoja");

  if (btnCrearHoja) {
    btnCrearHoja.disabled = true;
    btnCrearHoja.textContent = "GENERANDO COPIA...";
  }

  if (statusInicio) statusInicio.textContent = "Duplicando plantilla en Google Drive...";

  try {
    const response = await createSheetCopy();

    if (response && response.sheetUrl) {
      if (nuevoEnlaceInput) nuevoEnlaceInput.value = response.sheetUrl;
      if (sheetUrlInput) sheetUrlInput.value = response.sheetUrl;
      if (statusInicio) statusInicio.textContent = "¡Copia creada con éxito!";
    } else {
      throw new Error("No se recibió la URL del servidor.");
    }

  } catch (error) {
    console.error("Error al crear hoja:", error);
    if (statusInicio) {
      statusInicio.textContent = "Error: " + (error.message || "No se pudo generar la copia");
    }
  } finally {
    if (btnCrearHoja) {
      btnCrearHoja.disabled = false;
      btnCrearHoja.textContent = "CARGAR / CREAR HOJA DE TRABAJO";
    }
  }
}

/**
 * Procesa la lista multilínea de variables y las guarda en la hoja 'descriptores'
 */
async function handleAgregarListaVariables() {
  const statusInicio = document.getElementById("status-inicio");
  const nuevoEnlaceInput = document.getElementById("nuevo-enlace-input");
  const textareaVars = document.getElementById("lista-variables-textarea");
  const btnAgregarLista = document.getElementById("btn-agregar-variables-lista");

  const sheetUrl = nuevoEnlaceInput ? nuevoEnlaceInput.value.trim() : "";
  const contenidoTexto = textareaVars ? textareaVars.value.trim() : "";

  if (!sheetUrl) {
    alert("Primero debes hacer clic en 'CARGAR / CREAR HOJA DE TRABAJO'.");
    return;
  }

  if (!contenidoTexto) {
    alert("Por favor escribe las variables en el recuadro (una por línea).");
    return;
  }

  // Convierte las líneas ingresadas en una lista limpia de cadenas
  const lineasVariables = contenidoTexto
    .split("\n")
    .map(linea => linea.trim())
    .filter(linea => linea.length > 0);

  if (lineasVariables.length === 0) {
    alert("Ingresa variables válidas.");
    return;
  }

  if (btnAgregarLista) {
    btnAgregarLista.disabled = true;
    btnAgregarLista.textContent = "GUARDANDO VARIABLES...";
  }

  if (statusInicio) statusInicio.textContent = `Enviando ${lineasVariables.length} variable(s) a Google Sheets...`;

  try {
    await addMultipleVariablesToSheet(sheetUrl, lineasVariables);
    
    if (statusInicio) {
      statusInicio.textContent = `¡Éxito! Se agregaron ${lineasVariables.length} variable(s) a la hoja 'descriptores'.`;
    }
    
    // Limpia el área de texto tras guardar exitosamente
    if (textareaVars) {
      textareaVars.value = "";
      textareaVars.style.height = "auto";
    }

  } catch (error) {
    console.error("Error al registrar lista de variables:", error);
    if (statusInicio) {
      statusInicio.textContent = "Error: " + (error.message || "No se pudieron agregar las variables.");
    }
  } finally {
    if (btnAgregarLista) {
      btnAgregarLista.disabled = false;
      btnAgregarLista.textContent = "CARGAR VARIABLES A LA HOJA";
    }
  }
}

/**
 * Carga las variables de la pestaña 'descriptores' al select de la pestaña Google Sheets
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

    if (statusCarga) statusCarga.textContent = "¡Variables cargadas!";

  } catch (error) {
    console.error("Error al cargar variables:", error);
    if (statusCarga) {
      statusCarga.textContent = typeof error === "string" ? error : (error.message || "Error al cargar");
    }
  }
}

/**
 * Recibe el texto leído del escáner QR
 */
function handleQrScanned(qrText) {
  if (isProcessing) return;
  isProcessing = true;

  const qrResultText = document.getElementById("qr-result-text");
  const accesionInput = document.getElementById("accesion-input");

  if (qrResultText) qrResultText.value = qrText;
  if (accesionInput) accesionInput.value = qrText;

  setTimeout(() => {
    isProcessing = false;
  }, 2500);
}

/**
 * Copia el texto escaneado al portapapeles
 */
function copyToClipboard() {
  const qrResultText = document.getElementById("qr-result-text");
  const copyBtn = document.getElementById("copy-btn");

  if (!qrResultText || !qrResultText.value) return;

  navigator.clipboard.writeText(qrResultText.value)
    .then(() => {
      if (copyBtn) copyBtn.textContent = "¡COPIADO!";
      setTimeout(() => { if (copyBtn) copyBtn.textContent = "COPIAR TEXTO"; }, 2000);
    })
    .catch(() => {
      qrResultText.select();
      document.execCommand("copy");
      if (copyBtn) copyBtn.textContent = "¡COPIADO!";
      setTimeout(() => { if (copyBtn) copyBtn.textContent = "COPIAR TEXTO"; }, 2000);
    });
}

/**
 * Ventana Modal para confirmación de la URL de destino
 */
function abrirModalUrl() {
  const modal = document.getElementById("modal-url");
  const modalInput = document.getElementById("modal-url-input");
  const mainUrl = document.getElementById("sheet-url-input")?.value.trim();

  if (modalInput) modalInput.value = mainUrl || "";
  if (modal) modal.classList.remove("hidden");
}

function cerrarModalUrl() {
  const modal = document.getElementById("modal-url");
  if (modal) modal.classList.add("hidden");
}

/**
 * Confirma el envío de los 4 datos (Accesión, Variable, Repetición y Medición)
 */
async function confirmarGuardadoConUrl() {
  const modalInput = document.getElementById("modal-url-input");
  const statusCarga = document.getElementById("status-carga");
  const mainUrlInput = document.getElementById("sheet-url-input");

  const sheetUrlFinal = modalInput ? modalInput.value.trim() : "";

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
      btnGuardar.textContent = "GUARDAR REGISTRO";
    }
  }
}