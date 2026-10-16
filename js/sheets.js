// URL de la aplicación web actualizada desplegada en Google Apps Script (Versión 14)
const SAVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzQKe-J8eaRmxhpkIy_wO8HKsJmtpeHamXlOMv3Gh_b10K2VxVMqYh8DgbfmBYFZdx_/exec";

/**
 * Pide a Google Apps Script que lea la columna 'variable' de la pestaña 'descriptores'
 */
async function fetchDescriptorsVariables(sheetUrl) {
  if (!sheetUrl) {
    throw new Error("Ingresa un enlace válido de Google Sheets");
  }

  const response = await fetch(SAVE_WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      action: "getVariables",
      sheetUrl: sheetUrl
    })
  });

  const resText = await response.text();
  let result;
  try {
    result = JSON.parse(resText);
  } catch (e) {
    throw new Error("Respuesta inválida del servidor");
  }

  if (result.status === "error") {
    throw new Error(result.message);
  }

  return result.variables;
}

/**
 * Envía un nuevo registro a Google Sheets para guardarlo en la pestaña 'evaluacion'
 */
async function saveRecordToSheets(data) {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script en SAVE_WEB_APP_URL");
  }

  await fetch(SAVE_WEB_APP_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });

  return { status: "success" };
}