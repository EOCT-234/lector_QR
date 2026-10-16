const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwWNcyzhdRExyCVKTX0YdIQGRLPZmAbRzAX_AZSypnWMaWdG9X9-GlNX3dSUgd23JPqKQ/exec";

/**
 * Petición mediante JSONP para evitar bloqueos de CORS de Google Apps Script
 */
function fetchDescriptorsVariables(sheetUrl) {
  return new Promise((resolve, reject) => {
    if (!sheetUrl || !sheetUrl.includes("docs.google.com/spreadsheets")) {
      return reject("Por favor ingresa un enlace válido de Google Sheets.");
    }

    // Nombre único para la función callback global
    const callbackName = "jsonp_callback_" + Math.round(100000 * Math.random());

    // Crear elemento script dinámico
    const script = document.createElement("script");
    const encodedUrl = encodeURIComponent(sheetUrl);
    script.src = `${WEB_APP_URL}?sheetUrl=${encodedUrl}&callback=${callbackName}`;

    // Configurar tiempo de espera (Timeout de 10 segundos)
    const timeout = setTimeout(() => {
      cleanup();
      reject("Tiempo de espera agotado. Verifica el enlace y el despliegue del script.");
    }, 10000);

    // Definir la función global temporal
    window[callbackName] = function(data) {
      cleanup();
      if (data && data.status === "success" && Array.isArray(data.variables)) {
        resolve(data.variables);
      } else {
        reject(data ? data.message : "Error al obtener las variables.");
      }
    };

    // Manejo de errores de red
    script.onerror = function() {
      cleanup();
      reject("Error de conexión al intentar comunicarse con Apps Script.");
    };

    function cleanup() {
      clearTimeout(timeout);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    }

    // Insertar el script en el documento para iniciar la petición
    document.body.appendChild(script);
  });
}