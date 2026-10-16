// Déjala así por el momento si no usas Google Sheets.
// Si en el futuro quieres conectarlo, aquí pegas la URL de Apps Script.
const GOOGLE_SHEETS_SCRIPT_URL = "AQUI_VA_TU_URL_DE_APPS_SCRIPT";

/**
 * Función que verifica si la URL de Google Sheets ha sido configurada
 */
function isGoogleSheetsConfigured() {
  return GOOGLE_SHEETS_SCRIPT_URL !== "" && 
         GOOGLE_SHEETS_SCRIPT_URL !== "AQUI_VA_TU_URL_DE_APPS_SCRIPT";
}

/**
 * Envía la información a Google Sheets únicamente si la URL es válida
 */
async function sendToGoogleSheets(qrData) {
  if (!isGoogleSheetsConfigured()) {
    return false;
  }

  try {
    const payload = {
      qrData: qrData,
      timestamp: new Date().toISOString()
    };

    await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (error) {
    console.error("Error al enviar a Google Sheets:", error);
    return false;
  }
}