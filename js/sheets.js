// URL desplegada de Google Apps Script
const SAVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwI_LzIVPXcrt6yKJguR5t81yudU_3yiFW_78RqAentwjqa449nddvsxda-3teeHieD5Q/exec";

/**
 * Solicita a Apps Script la clonación de la plantilla original
 */
async function createSheetCopy() {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script.");
  }

  const requestUrl = `${SAVE_WEB_APP_URL}?action=crear_copia`;

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error("No se pudo conectar con Google Apps Script.");
    }

    const result = await response.json();

    if (result.status === "error") {
      throw new Error(result.message || "Error al duplicar la plantilla.");
    }

    return result; // Retorna { status: 'success', sheetUrl: 'https://docs.google.com/...' }
  } catch (error) {
    console.error("Error al crear copia:", error);
    throw error;
  }
}

/**
 * Obtiene la lista de variables de la pestaña 'descriptores'
 */
async function fetchDescriptorsVariables(sheetUrl) {
  const targetUrl = sheetUrl ? sheetUrl.trim() : "";
  const requestUrl = `${SAVE_WEB_APP_URL}?sheetUrl=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(requestUrl, { method: "GET", redirect: "follow" });
    if (!response.ok) throw new Error("Error al conectar con Google Apps Script.");

    const result = await response.json();
    if (result.status === "error") throw new Error(result.message || "Error al cargar variables.");

    return result.variables || [];
  } catch (error) {
    console.error("Error al obtener variables:", error);
    throw error;
  }
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

  const response = await fetch(`${SAVE_WEB_APP_URL}?${queryParams.toString()}`);
  const result = await response.json();

  if (result.status === "error") {
    throw new Error(result.message || "Error al agregar las variables.");
  }

  return result;
}

/**
 * Envía la fila con los 4 datos (Accesión, Variable, Repetición, Medición) por POST
 */
async function saveRecordToSheets(data) {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script");
  }

  // Si no hay URL cargada, primero crea la copia de la plantilla
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