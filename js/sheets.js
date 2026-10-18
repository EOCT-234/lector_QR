// URL desplegada de Google Apps Script (Corregido 'https' y actualizado a tu nueva URL)
const SAVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwI_LzIVPXcrt6yKJguR5t81yudU_3yiFW_78RqAentwjqa449nddvsxda-3teeHieD5Q/exec";

/**
 * Obtiene la columna 'variable' de la pestaña 'descriptores' directamente vía Apps Script o CSV
 */
async function fetchDescriptorsVariables(sheetUrl) {
  // Si no se proporciona un sheetUrl, la función llamará a Apps Script para leer la plantilla por defecto
  const targetUrl = sheetUrl ? sheetUrl.trim() : "";
  const requestUrl = `${SAVE_WEB_APP_URL}?sheetUrl=${encodeURIComponent(targetUrl)}`;

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error("No se pudo conectar con el servicio de Google Apps Script.");
    }

    const result = await response.json();

    if (result.status === "error") {
      throw new Error(result.message || "Error al leer la hoja de variables.");
    }

    return result.variables || [];

  } catch (error) {
    console.error("Error al obtener variables:", error);
    throw error;
  }
}

/**
 * Envía todos los datos (copia, variables, accesión, variable, repetición y medición) a Apps Script
 */
async function saveRecordToSheets(data) {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script en SAVE_WEB_APP_URL");
  }

  // Prepara el paquete completo de datos en JSON
  const payload = {
    nuevoNombre: data.nuevoNombre || "",
    variablesManuales: data.variablesManuales || [],
    sheetUrl: data.sheetUrl || "",
    accesion: data.accesion || "",
    variable: data.variable || "",
    repeticion: data.repeticion || "",
    medicion: data.medicion || ""
  };

  try {
    const response = await fetch(SAVE_WEB_APP_URL, {
      method: "POST",
      mode: "no-cors", // Requerido para evitar bloqueos CORS en peticiones cruzadas
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    return { status: "success" };
  } catch (error) {
    console.error("Error en la solicitud POST:", error);
    throw new Error("No se pudo enviar la información a Google Sheets.");
  }
}