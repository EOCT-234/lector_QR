document.addEventListener("DOMContentLoaded", () => {
  // Elementos de la pestaña Inicio
  const btnCrearHoja = document.getElementById("btn-crear-hoja");
  const btnCopiarEnlace = document.getElementById("btn-copiar-enlace");
  const btnSubirVariables = document.getElementById("btn-subir-variables");
  const inputNuevoEnlace = document.getElementById("nuevo-enlace");
  const textareaVariables = document.getElementById("variables-textarea");
  const inicioStatus = document.getElementById("inicio-status");

  // Elementos de la pestaña Google Sheets
  const sheetUrlInput = document.getElementById("sheet-url");
  const btnCargarVariables = document.getElementById("btn-cargar-variables");
  const variableSelect = document.getElementById("variable-select");
  const evaluationForm = document.getElementById("evaluation-form");
  const sheetsStatus = document.getElementById("sheets-status");

  // Navegación por pestañas
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      const activeContent = document.getElementById(targetTab);
      if (activeContent) {
        activeContent.classList.add("active");
      }
    });
  });

  // Auto-ajuste de altura para el textarea de variables
  if (textareaVariables) {
    textareaVariables.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }

  // EVENTO 1: Crear Hoja de Trabajo
  if (btnCrearHoja) {
    btnCrearHoja.addEventListener("click", async () => {
      inicioStatus.textContent = "Creando hoja de trabajo en Google Drive...";
      inicioStatus.className = "status-message info";

      try {
        const result = await createSheetCopy();

        if (result && result.sheetUrl) {
          inputNuevoEnlace.value = result.sheetUrl;

          // Autocompleta también el campo en la pestaña de registro
          if (sheetUrlInput) {
            sheetUrlInput.value = result.sheetUrl;
          }

          inicioStatus.textContent = "¡Hoja de trabajo creada exitosamente!";
          inicioStatus.className = "status-message success";
        }
      } catch (error) {
        inicioStatus.textContent = "Error: " + error.message;
        inicioStatus.className = "status-message error";
      }
    });
  }

  // EVENTO 2: Copiar Enlace
  if (btnCopiarEnlace) {
    btnCopiarEnlace.addEventListener("click", () => {
      const enlace = inputNuevoEnlace ? inputNuevoEnlace.value.trim() : "";

      if (!enlace) {
        inicioStatus.textContent = "No hay ningún enlace generado para copiar.";
        inicioStatus.className = "status-message error";
        return;
      }

      navigator.clipboard
        .writeText(enlace)
        .then(() => {
          inicioStatus.textContent = "¡Enlace copiado al portapapeles!";
          inicioStatus.className = "status-message success";
        })
        .catch(() => {
          // Respaldo para navegadores que restringen clipboard API
          inputNuevoEnlace.select();
          document.execCommand("copy");
          inicioStatus.textContent = "¡Enlace copiado al portapapeles!";
          inicioStatus.className = "status-message success";
        });
    });
  }

  // EVENTO 3: Subir Variables
  if (btnSubirVariables) {
    btnSubirVariables.addEventListener("click", async () => {
      const sheetUrl = inputNuevoEnlace ? inputNuevoEnlace.value.trim() : "";
      const texto = textareaVariables ? textareaVariables.value.trim() : "";

      if (!sheetUrl) {
        inicioStatus.textContent = "Primero debes crear una hoja de trabajo.";
        inicioStatus.className = "status-message error";
        return;
      }

      if (!texto) {
        inicioStatus.textContent = "Escribe al menos una variable en el cuadro.";
        inicioStatus.className = "status-message error";
        return;
      }

      // Convertir el texto multilinea a un arreglo limpiando espacios vacíos
      const listaVariables = texto
        .split("\n")
        .map((v) => v.trim())
        .filter(Boolean);

      inicioStatus.textContent = "Subiendo variables a Google Sheets...";
      inicioStatus.className = "status-message info";

      try {
        await addMultipleVariablesToSheet(sheetUrl, listaVariables);
        inicioStatus.textContent = `¡Se subieron ${listaVariables.length} variables exitosamente!`;
        inicioStatus.className = "status-message success";
        textareaVariables.value = "";
        textareaVariables.style.height = "auto";
      } catch (error) {
        inicioStatus.textContent = "Error: " + error.message;
        inicioStatus.className = "status-message error";
      }
    });
  }

  // EVENTO 4: Cargar Variables en la pestaña Google Sheets
  if (btnCargarVariables) {
    btnCargarVariables.addEventListener("click", async () => {
      const url = sheetUrlInput ? sheetUrlInput.value.trim() : "";

      if (!url) {
        sheetsStatus.textContent = "Por favor ingresa la URL de Google Sheets.";
        sheetsStatus.className = "status-message error";
        return;
      }

      sheetsStatus.textContent = "Cargando variables...";
      sheetsStatus.className = "status-message info";

      try {
        const variables = await fetchDescriptorsVariables(url);
        variableSelect.innerHTML = '<option value="">-- Selecciona una Variable --</option>';

        if (variables.length === 0) {
          sheetsStatus.textContent = "No se encontraron variables en la hoja 'descriptores'.";
          sheetsStatus.className = "status-message error";
          return;
        }

        variables.forEach((v) => {
          const option = document.createElement("option");
          option.value = v;
          option.textContent = v;
          variableSelect.appendChild(option);
        });

        sheetsStatus.textContent = `¡Se cargaron ${variables.length} variables correctamente!`;
        sheetsStatus.className = "status-message success";
      } catch (error) {
        sheetsStatus.textContent = "Error al cargar variables: " + error.message;
        sheetsStatus.className = "status-message error";
      }
    });
  }

  // EVENTO 5: Guardar Registro (Formulario de 4 Campos)
  if (evaluationForm) {
    evaluationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = {
        sheetUrl: sheetUrlInput ? sheetUrlInput.value.trim() : "",
        accesion: document.getElementById("accesion-input").value.trim(),
        variable: variableSelect ? variableSelect.value : "",
        repeticion: document.getElementById("repeticion-input").value.trim(),
        medicion: document.getElementById("medicion-input").value.trim()
      };

      sheetsStatus.textContent = "Guardando registro...";
      sheetsStatus.className = "status-message info";

      try {
        await saveRecordToSheets(data);
        sheetsStatus.textContent = "¡Registro guardado exitosamente!";
        sheetsStatus.className = "status-message success";

        // Limpiar campos de medición para la siguiente entrada
        document.getElementById("medicion-input").value = "";
      } catch (error) {
        sheetsStatus.textContent = "Error al guardar el registro: " + error.message;
        sheetsStatus.className = "status-message error";
      }
    });
  }
});