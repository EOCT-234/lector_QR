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

  // 1. Limpiar espacios del enlace
  const cleanUrl = sheetUrl.trim();

  // 2. Extraer el ID del libro mediante Expresión Regular
  const idMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch || !idMatch[1]) {
    throw new Error("No se pudo extraer el ID del enlace de Google Sheets");
  }

  const spreadsheetId = idMatch[1];
  
  // 3. Construir la URL directa de exportación CSV para la hoja 'descriptores'
  const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=descriptores`;

  try {
    const response = await fetch(csvUrl);

    if (!response.ok) {
      throw new Error("No se pudo acceder a la hoja. Verifica que el enlace esté compartido como público.");
    }

    const csvText = await response.text();

    if (!csvText || csvText.includes("<!DOCTYPE html>")) {
      throw new Error("Verifica que la pestaña se llame 'descriptores' y la hoja sea pública.");
    }

    // 4. Procesar el contenido CSV por líneas
    const lines = csvText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error("La hoja 'descriptores' está vacía.");
    }

    // Parsear la primera fila (encabezados)
    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());

    // Buscar el índice de la columna 'variable'
    let colIndex = headers.indexOf("variable");
    if (colIndex === -1) {
      colIndex = 0; // Si no encuentra el encabezado 'variable', usa la Columna A
    }

    // Extraer las opciones de la columna
    const variables = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (row[colIndex] && row[colIndex].trim() !== "") {
        variables.push(row[colIndex].trim());
      }
    }

    if (variables.length === 0) {
      throw new Error("No se encontraron datos en la columna 'variable'.");
    }