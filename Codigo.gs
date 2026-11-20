// ID de tu plantilla original de Google Sheets
const ID_PLANTILLA_ORIGINAL = "1Jufv2cunUgPpIKFADwijAQZ4XEN7e_XWztXH5hYypoY";

function doGet(e) {
  try {
    const params = e ? e.parameter : {};

    // ACCIÓN 1: Crear una copia de la plantilla base
    if (params.action === "crear_copia") {
      const archivoPlantilla = DriveApp.getFileById(ID_PLANTILLA_ORIGINAL);
      const nombreCopia = "Registro Evaluaciones - " + new Date().toLocaleDateString("es-ES");
      
      const nuevaCopia = archivoPlantilla.makeCopy(nombreCopia);
      nuevaCopia.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      
      const nuevaUrl = nuevaCopia.getUrl();
      const targetSpreadsheet = SpreadsheetApp.openByUrl(nuevaUrl);

      let hojaRegistro = targetSpreadsheet.getSheetByName("registro");
      if (!hojaRegistro) {
        hojaRegistro = targetSpreadsheet.insertSheet("registro");
        hojaRegistro.appendRow(["Accesión", "Variable", "Repetición", "Medición"]);
      }

      // Asegurar encabezados en la pestaña 'descriptores' al crear la copia
      let hojaDescriptores = targetSpreadsheet.getSheetByName("descriptores");
      if (!hojaDescriptores) {
        hojaDescriptores = targetSpreadsheet.insertSheet("descriptores");
        hojaDescriptores.getRange("A1:B1").setValues([["Variables", "Código"]]);
      } else {
        // Si la plantilla ya traía la hoja 'descriptores', asegura el encabezado en B1
        if (!hojaDescriptores.getRange("A1").getValue()) {
          hojaDescriptores.getRange("A1").setValue("Variables");
        }
        if (!hojaDescriptores.getRange("B1").getValue()) {
          hojaDescriptores.getRange("B1").setValue("Código");
        }
      }

      return responderJSON({ status: "success", sheetUrl: nuevaUrl }, e);
    }

    // ACCIÓN 2: Agregar lista masiva de variables + código de 4 letras a 'descriptores'
    if (params.action === "agregar_variables_lista") {
      if (!params.sheetUrl || !params.variablesJSON) {
        throw new Error("Falta la URL de la hoja o la lista de variables.");
      }

      const listaVars = JSON.parse(params.variablesJSON);
      const ss = SpreadsheetApp.openByUrl(params.sheetUrl);
      let hojaDescriptores = ss.getSheetByName("descriptores");

      if (!hojaDescriptores) {
        hojaDescriptores = ss.insertSheet("descriptores");
        hojaDescriptores.getRange("A1:B1").setValues([["Variables", "Código"]]);
      } else {
        // Asegura que ambas columnas tengan encabezado si la hoja venía de la plantilla
        if (!hojaDescriptores.getRange("A1").getValue()) {
          hojaDescriptores.getRange("A1").setValue("Variables");
        }
        if (!hojaDescriptores.getRange("B1").getValue()) {
          hojaDescriptores.getRange("B1").setValue("Código");
        }
      }

      const filasNuevas = [];

      listaVars.forEach(item => {
        let nombreVar = "";
        let codigoVar = "";

        if (typeof item === "object" && item !== null) {
          nombreVar = String(item.variable || "").trim();
          codigoVar = String(item.codigo || "").trim();
        } else if (typeof item === "string") {
          nombreVar = item.trim();
        }

        if (nombreVar !== "") {
          // Si no vino el código desde el frontend, toma las 4 primeras letras sin espacios ni tildes
          if (!codigoVar) {
            codigoVar = nombreVar
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, "")
              .substring(0, 4)
              .toUpperCase();
          }
          filasNuevas.push([nombreVar, codigoVar]);
        }
      });

      // Inserta todas las filas juntas en columnas A y B
      if (filasNuevas.length > 0) {
        const ultimaFila = hojaDescriptores.getLastRow();
        hojaDescriptores.getRange(ultimaFila + 1, 1, filasNuevas.length, 2).setValues(filasNuevas);
      }

      return responderJSON({ status: "success", agregadas: filasNuevas.length }, e);
    }

    // ACCIÓN 3: Leer las variables registradas en la hoja 'descriptores'
    const sheetUrl = params.sheetUrl;
    const ss = sheetUrl ? SpreadsheetApp.openByUrl(sheetUrl) : SpreadsheetApp.openById(ID_PLANTILLA_ORIGINAL);
    const hojaDescriptores = ss.getSheetByName("descriptores");

    if (!hojaDescriptores) {
      throw new Error("No se encontró la hoja 'descriptores'.");
    }

    const datos = hojaDescriptores.getDataRange().getValues();
    const variables = datos.slice(1).map(fila => fila[0]).filter(Boolean);

    return responderJSON({ status: "success", variables: variables }, e);

  } catch (err) {
    return responderJSON({ status: "error", message: err.toString() }, e);
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!data.sheetUrl) throw new Error("No se proporcionó la URL de destino.");

    const targetSpreadsheet = SpreadsheetApp.openByUrl(data.sheetUrl);
    let hojaRegistro = targetSpreadsheet.getSheetByName("registro");
    
    if (!hojaRegistro) {
      hojaRegistro = targetSpreadsheet.insertSheet("registro");
      hojaRegistro.appendRow(["Accesión", "Variable", "Repetición", "Medición"]);
    }

    // Registrar estrictamente las 4 columnas requeridas
    hojaRegistro.appendRow([
      data.accesion || "",
      data.variable || "",
      data.repeticion || "",
      data.medicion || ""
    ]);

    return responderJSON({ status: "success" }, e);
  } catch (error) {
    return responderJSON({ status: "error", message: error.toString() }, e);
  }
}

/**
 * Función auxiliar para formatear respuestas JSON y dar soporte a JSONP
 */
function responderJSON(objeto, e) {
  const output = JSON.stringify(objeto);
  const callback = e && e.parameter && e.parameter.callback;

  if (callback) {
    return ContentService.createTextOutput(callback + "(" + output + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}