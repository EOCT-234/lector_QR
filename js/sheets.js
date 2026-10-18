// URL desplegada de Google Apps Script
const SAVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbx4739QWxga8PsjGV7S0day0Xi4V7WPg9_p17gbzubTGY1BwGXLoe-0FzOkj6fOD7gY/exec";

/**
 * Función auxiliar para realizar peticiones GET usando JSONP (evita bloqueos de CORS en navegadores)
 */
function fetchJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_cb_' + Math.round(100000 * Math.random());
    const script = document.createElement('script');

    // Manejador de respuesta global
    window[callbackName] = function(data) {
      delete window[callbackName];
      document.body.removeChild(script);
      if (data && data.status === "error") {
        reject(new Error(data.message || "Error en la petición a Apps Script"));
      } else {
        resolve(data);
      }
    };

    // Manejo de errores de red
    script.onerror = function() {
      delete window[callbackName];
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      reject(new Error("No se pudo conectar con Google Apps Script. Revisa los permisos de despliegue."));
    };

    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

/**
 * Solicita a Apps Script la clonación de la plantilla original
 */
async function createSheetCopy() {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script.");
  }

  const requestUrl = `${SAVE_WEB_APP_URL}?action=crear_copia`;
  return await fetchJSONP(requestUrl);
}

/**
 * Obtiene la lista de variables de la pestaña 'descriptores'
 */
async function fetchDescriptorsVariables(sheetUrl) {
  const targetUrl = sheetUrl ? sheetUrl.trim() : "";
  const requestUrl = `${SAVE_WEB_APP_URL}?sheetUrl=${encodeURIComponent(targetUrl)}`;
  const result = await fetchJSONP(requestUrl);
  return result.variables || [];
}

/**
 * Envía una lista de múltiples variables a la pestaña 'descriptores'
 */
async function addMultipleVariablesToSheet(sheetUrl, listaVariables) {
  if (!sheetUrl) {
    throw new Error("Primero debes crear o ingresar la URL de la hoja de cálculo.");
  }

  if (!listaVariables || listaVariables.length === 0) {
    throw new Error("Escribe al menos una variable en el cuadro.");
  }

  const queryParams = new URLSearchParams({
    action: "agregar_variables_lista",
    sheetUrl: sheetUrl,
    variablesJSON: JSON.stringify(listaVariables)
  });

  return await fetchJSONP(`${SAVE_WEB_APP_URL}?${queryParams.toString()}`);
}

/**
 * Envía la fila con los 4 datos (Accesión, Variable, Repetición, Medición) por POST
 */
async function saveRecordToSheets(data) {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script");
  }

  if (!data.sheetUrl) {
    const copiaResult = await createSheetCopy();
    data.sheetUrl = copiaResult.sheetUrl;
  }

  const payload = {
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