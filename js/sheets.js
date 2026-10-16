// URL de la aplicación web desplegada en Google Apps Script
const SAVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyzR-m9T94BpPtq557bo87d7JVog4lUlHoDymRZW1oM8B2vnVmLLwlmk1we0Y91e1wQ/exec";

/**
 * Obtiene la columna 'variable' de la hoja 'descriptores' mediante exportación pública CSV.
 * Compatible con delimitadores dinámicos (comas o tabulaciones).
 */
async function fetchDescriptorsVariables(sheetUrl) {
  if (!sheetUrl) {
    throw new Error("Ingresa un enlace válido de Google Sheets");
  }

  const cleanUrl = sheetUrl.trim();
  const idMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch || !idMatch[1]) {
    throw new Error("No se pudo extraer el ID del enlace de Google Sheets");
  }

  const spreadsheetId = idMatch[1];
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=descriptores`;

  try {
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error("No se pudo acceder a la hoja. Verifica que el enlace esté compartido como público.");
    }

    const csvText = await response.text();

    if (!csvText || csvText.toLowerCase().includes("<!doctype html>")) {
      throw new Error("Verifica que la pestaña se llame 'descriptores' y la hoja esté compartida como pública.");
    }

    const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error("La hoja 'descriptores' está vacía o no tiene datos suficientes.");
    }

    const firstLine = lines[0];
    const delimiter = firstLine.includes("\t") ? "\t" : ",";

    const headers = parseCsvLine(firstLine, delimiter).map(h => h.toLowerCase().trim());

    let colIndex = headers.indexOf("variable");
    if (colIndex === -1) {
      colIndex = 0;
    }

    const variables = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i], delimiter);
      if (row[colIndex] && row[colIndex].trim() !== "") {
        variables.push(row[colIndex].trim());
      }
    }

    if (variables.length === 0) {
      throw new Error("No se encontraron datos en la columna 'variable'.");
    }

    return variables;

  } catch (error) {
    console.error("Error al obtener variables desde Google Sheets:", error);
    throw error;
  }
}

/**
 * Envía la solicitud a Google Apps Script para crear/verificar la pestaña 'registro'
 */
async function saveRecordToSheets(data) {
  if (!SAVE_WEB_APP_URL) {
    throw new Error("Falta configurar la URL de Apps Script en SAVE_WEB_APP_URL");
  }

  // Envío sin CORS restrictivo para permitir la llamada desde cualquier origen
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

/**
 * Función auxiliar para parsear líneas CSV
 */
function parseCsvLine(line, delimiter = ",") {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.replace(/^"|"$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, '').trim());
  return result;
}