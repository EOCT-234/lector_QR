const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzQv94yEEN6HMHS58VGdvMNBtq8au6UptL-Zu3ujqEeRpoWuwQXImuv_2zhCs9IMwC92A/exec";

/**
 * Petición mediante JSONP para evitar bloqueos de CORS de Google Apps Script
 */
function fetchDescriptorsVariables(sheetUrl) {
  return new Promise((resolve, reject) => {
    if (!sheetUrl || !sheetUrl.includes("docs.google.com/spreadsheets")) {
      return reject("Por favor ingresa un enlace válido de Google Sheets.");
    }

    // Genera un nombre de función callback único
    const callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());

    // Crea el elemento script dinámico
    const script = document.createElement("script");
    const encodedUrl = encodeURIComponent(sheetUrl);
    script.src = `${WEB_APP_URL}?sheetUrl=${encodedUrl}&callback=${callbackName}`;

    // Tiempo límite de respuesta (10 segundos)
    const timeout = setTimeout(() => {
      cleanup();
      reject("Tiempo de espera agotado. Verifica el enlace y el despliegue del script.");
    }, 10000);

    // Definición de la función global temporal para recibir los datos
    window[callbackName] = function(data) {
      cleanup();
      if (data && data.status === "success" && Array.isArray(data.variables)) {
        resolve(data.variables);
      } else {
        reject(data ? data.message : "Error al obtener las variables.");
      }
    };

    // Manejo de error en la petición
    script.onerror = function() {
      cleanup();
      reject("Error de conexión al intentar comunicarse con Apps Script.");
    };

    function cleanup() {
      clearTimeout(timeout);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    }

    // Inserta el script para disparar la llamada a Apps Script
    document.body.appendChild(script);
  });
}