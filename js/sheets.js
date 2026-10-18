// URL desplegada de Google Apps Script
const SAVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx4739QWxga8PsjGV7S0day0Xi4V7WPg9_p17gbzubTGY1BwGXLoe-0FzOkj6fOD7gY/exec";

/**
 * Función helper para realizar peticiones mediante JSONP (evita bloqueos de CORS)
 */
function callAppsScriptJSONP(paramsObj) {
  return new Promise((resolve, reject) => {
    const callbackName = 'cb_' + Math.round(1000000 * Math.random());
    const script = document.createElement('script');

    // Callback global de respuesta
    window[callbackName] = function(data) {
      delete window[callbackName];
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      
      if (data && data.status === "error") {
        reject(new Error(data.message || "Error devuelto por Google Apps Script"));
      } else {
        resolve(data);
      }
    };

    // Manejo de errores de red o fallo de conexión
    script.onerror = function() {
      delete window[callbackName];
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      reject(new Error("No se pudo conectar con Google Apps Script. Revisa la URL y los permisos de despliegue."));
    };

    const urlParams = new URLSearchParams(paramsObj);
    urlParams.append("callback", callbackName);

    script.src = `${SAVE_WEB_APP_URL}?${urlParams.toString()}`;
    document.body.appendChild(script);
  });
}

/**
 * Solicita la creación de la copia de la plantilla y retorna la URL del nuevo libro
 */
async function createSheetCopy() {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script.");
  }

  const result = await callAppsScriptJSONP({ action: "crear_copia" });

  if (result && (result.sheetUrl || result.url)) {
    const urlFinal = result.sheetUrl || result.url;

    // Autocompleta la URL de la hoja en la pestaña Google Sheets
    const sheetUrlInput = document.getElementById("sheet-url");
    if (sheetUrlInput) {
      sheetUrlInput.value = urlFinal;
    }

    return { status: "success", sheetUrl: urlFinal };
  } else {
    throw new Error("No se pudo obtener la URL de la hoja creada.");
  }
}

/**
 * Carga las variables de la pestaña 'descriptores'
 */
async function fetchDescriptorsVariables(sheetUrl) {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script.");
  }

  const result = await callAppsScriptJSONP({ sheetUrl: sheetUrl ? sheetUrl.trim() : "" });
  return result.variables || [];
}

/**
 * Envía una lista masiva de variables a la pestaña 'descriptores'
 */
async function addMultipleVariablesToSheet(sheetUrl, listaVariables) {
  if (!sheetUrl) {
    throw new Error("Primero debes crear o ingresar la URL de la hoja de cálculo.");
  }

  if (!listaVariables || listaVariables.length === 0) {
    throw new Error("Escribe al menos una variable en el cuadro.");
  }

  return await callAppsScriptJSONP({
    action: "agregar_variables_lista",
    sheetUrl: sheetUrl.trim(),
    variablesJSON: JSON.stringify(listaVariables)
  });
}

/**
 * Guarda los 4 campos (Accesión, Variable, Repetición, Medición) en la pestaña 'registro'
 */
async function saveRecordToSheets(data) {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script.");
  }

  if (!data.sheetUrl) {
    const copiaResult = await createSheetCopy();
    data.sheetUrl = copiaResult.sheetUrl;
  }

  const payload = {
    action: "guardar_registro",
    sheetUrl: data.sheetUrl,
    accesion: data.accesion || "",
    variable: data.variable || "",
    repeticion: data.repeticion || "",
    medicion: data.medicion || ""
  };

  await fetch(SAVE_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });

  return { status: "success", sheetUrl: data.sheetUrl };
}