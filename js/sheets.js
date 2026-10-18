// js/sheets.js
const SAVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwI_LzIVPXcrt6yKJguR5t81yudU_3yiFW_78RqAentwjqa449nddvsxda-3teeHieD5Q/exec";

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
 * Envía exclusivamente: Accesión, Variable, Repetición y Medición
 */
async function saveRecordToSheets(data) {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script");
  }

  // 1. Si no hay URL cargada, duplica la plantilla en Drive y guarda los 4 datos
  if (!data.sheetUrl) {
    const queryParams = new URLSearchParams({
      action: "crear_copia",
      accesion: data.accesion || "",
      variable: data.variable || "",
      repeticion: data.repeticion || "",
      medicion: data.medicion || ""
    });

    const response = await fetch(`${SAVE_WEB_APP_URL}?${queryParams.toString()}`);
    const result = await response.json();

    if (result.status === "error") {
      throw new Error(result.message || "Error al clonar la plantilla");
    }

    return result; // Retorna { status: 'success', sheetUrl: '...' }
  }

  // 2. Si la URL ya existe, guarda únicamente la fila por POST
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