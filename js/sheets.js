// URL de la aplicación web actualizada desplegada en Google Apps Script
const SAVE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxOHJKiReDQk2IiveiIbpNpAZgrjq2JhO9HfmDabeocCo4DMX9SMH0P3ekQiX_r_52K/exec";

/**
 * Obtiene la columna 'variable' de la hoja 'descriptores' directamente
 * mediante la API de exportación pública CSV de Google Sheets.
 */
async function fetchDescriptorsVariables(sheetUrl) {
  if (!sheetUrl) {
    throw new Error("Ingresa un enlace válido de Google Sheets");
  }

  // 1. Extraer el ID único de la hoja mediante Expresión Regular
  const idMatch = sheetUrl.trim().match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch || !idMatch[1]) {
    throw new Error("El enlace ingresado no es un enlace válido de Google Sheets.");
  }

  const spreadsheetId = idMatch[1];
  
  // 2. Construir la URL limpia de exportación CSV para la pestaña 'descriptores'
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=descriptores`;

  try {
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error("No se pudo acceder a la hoja. Verifica la conexión.");
    }

    const csvText = await response.text();

    // Si la respuesta es una página HTML de inicio de sesión o error de permisos
    if (!csvText || csvText.toLowerCase().includes("<!doctype html>")) {
      throw new Error("No se pudo leer la pestaña 'descriptores'.");
    }

    // 3. Procesar el contenido CSV por líneas
    const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error("La pestaña 'descriptores' no tiene suficientes datos.");
    }

    // Parsear la primera fila (encabezados)
    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());

    // Buscar la columna 'variable' o usar la columna 0 (Columna A) por defecto
    let colIndex = headers.indexOf("variable");
    if (colIndex === -1) {
      colIndex = 0;
    }

    // Extraer cada elemento de la columna
    const variables = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (row[colIndex] && row[colIndex].trim() !== "") {
        variables.push(row[colIndex].trim());
      }
    }

    if (variables.length === 0) {
      throw new Error("No se encontraron elementos en la columna 'variable'.");
    }

    return variables;

  } catch (error) {
    console.error("Error al obtener variables desde Google Sheets:", error);
    throw error;
  }
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

/**
 * Función auxiliar para parsear líneas formateadas en CSV
 */
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.replace(/^"|"$/g, '').trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.replace(/^"|"$/g, '').trim());
  return result;
}