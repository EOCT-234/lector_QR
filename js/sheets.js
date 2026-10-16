const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwa3I_03AedoserCc65NsMMSzHlZthCTMrk-35h6ey6L9W48kgfACRN8HcrWzXxd32P0g/exec";

async function fetchDescriptorsVariables(sheetUrl) {
  if (!sheetUrl || !sheetUrl.includes("docs.google.com/spreadsheets")) {
    throw new Error("Por favor ingresa un enlace válido de Google Sheets.");
  }

  const requestUrl = `${WEB_APP_URL}?sheetUrl=${encodeURIComponent(sheetUrl)}`;

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === "success" && Array.isArray(data.variables)) {
      return data.variables;
    } else {
      throw new Error(data.message || "Error devuelto por Apps Script.");
    }
  } catch (error) {
    console.error("Detalle del error en fetch:", error);
    throw error;
  }
}