// URL de tu Web App de Google Apps Script centralizada
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwWNcyzhdRExyCVKTX0YdIQGRLPZmAbRzAX_AZSypnWMaWdG9X9-GlNX3dSUgd23JPqKQ/exec";

/**
 * Solicita a Apps Script central las variables de la hoja 'descriptores' del libro indicado.
 * @param {string} sheetUrl - El enlace completo del libro de Google Sheets.
 */
async function fetchDescriptorsVariables(sheetUrl) {
  if (!sheetUrl || !sheetUrl.includes("docs.google.com/spreadsheets")) {
    throw new Error("Por favor ingresa un enlace válido de Google Sheets.");
  }

  // Construir la URL agregando el parámetro sheetUrl
  const requestUrl = `${WEB_APP_URL}?sheetUrl=${encodeURIComponent(sheetUrl)}`;

  const response = await fetch(requestUrl);
  const data = await response.json();

  if (data.status === "success" && Array.isArray(data.variables)) {
    return data.variables;
  } else {
    throw new Error(data.message || "Error al leer la hoja 'descriptores'");
  }
}