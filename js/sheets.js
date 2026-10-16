// ⚠️ REEMPLAZA ESTA URL CON LA QUE TE DÉ GOOGLE APPS SCRIPT AL PUBLICARLO
const GOOGLE_SHEETS_SCRIPT_URL = "AQUI_VA_TU_URL_DE_APPS_SCRIPT";

/**
 * Envía la información del código QR a la hoja de cálculo de Google Sheets
 * @param {string} qrData - El texto obtenido al escanear el código QR
 * @returns {Promise<boolean>} Retorna true si la petición se envió correctamente
 */
async function sendToGoogleSheets(qrData) {
  try {
    const payload = {
      qrData: qrData,
      timestamp: new Date().toISOString()
    };

    // Petición HTTP POST enviando la información en formato JSON
    await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Requerido por los navegadores para peticiones cruzadas a Google Apps Script
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (error) {
    console.error("Error al enviar los datos a Google Sheets:", error);
    return false;
  }
}