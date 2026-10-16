// URL actualizada de la aplicación web (Versión 6)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzQv94yEEN6HMHS58VGdvMNBtq8au6UptL-Zu3ujqEeRpoWuwQXImuv_2zhCs9IMwC92A/exec";

/**
 * Solicita a Apps Script la lista de variables usando JSONP
 */
function fetchDescriptorsVariables(sheetUrl) {
  return new Promise((resolve, reject) => {
    // Limpiar espacios y caracteres extraños de la URL ingresada
    let cleanUrl = sheetUrl ? sheetUrl.trim().replace(/\\/g, '') : "";

    if (!cleanUrl || !cleanUrl.includes("docs.google.com/spreadsheets")) {
      return reject("Enlace no válido de Google Sheets");
    }

    const callbackName = "jsonp_cb_" + Math.round(100000 * Math.random());
    const script = document.createElement("script");
    const encodedUrl = encodeURIComponent(cleanUrl);
    
    script.src = `${WEB_APP_URL}?sheetUrl=${encodedUrl}&callback=${callbackName}`;

    const timeout = setTimeout(() => {
      cleanup();
      reject("Tiempo agotado: Revisa el enlace y el acceso de la hoja");
    }, 12000);

    window[callbackName] = function(data) {
      cleanup();
      if (data && data.status === "success" && Array.isArray(data.variables)) {
        resolve(data.variables);
      } else {
        reject(data ? data.message : "Error al obtener variables");
      }
    };

    script.onerror = function() {
      cleanup();
      reject("Error de conexión con Apps Script");
    };

    function cleanup() {
      clearTimeout(timeout);
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
    }

    document.body.appendChild(script);
  });
}