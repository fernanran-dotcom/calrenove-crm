/*
  INSTRUCCIONES:
  1. Abre https://sheets.google.com y crea una hoja nueva (o usa una existente)
  2. Ve a Extensiones > Apps Script
  3. Borra el código por defecto y pega este archivo
  4. Haz clic en "Implementar" > "Nueva implementación"
  5. Tipo: "App web", Ejecutar como: "Yo", Acceso: "Cualquier usuario"
  6. Copia la URL generada y pégala en config.js como googleSheetsWebAppUrl
  7. Haz clic en "Implementar"
*/

const SHEET_NAME = 'Presupuestos Calrenove';

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'id', 'numPresupuesto', 'fecha', 'fechaCreacion',
      'cliente_nombre', 'cliente_direccion', 'cliente_telefono', 'cliente_email',
      'marca_id', 'marca_nombre',
      'modelo_id', 'modelo_nombre',
      'precio_personalizado', 'opcionales', 'notas',
      'modelo_data'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet();
    
    sheet.appendRow([
      data.id || '',
      data.numPresupuesto || '',
      data.fecha || '',
      data.fechaCreacion || '',
      data.cliente?.nombre || '',
      data.cliente?.direccion || '',
      data.cliente?.telefono || '',
      data.cliente?.email || '',
      data.marca?.id || '',
      data.marca?.nombre || '',
      data.modelo?.id || '',
      data.modelo?.nombre || '',
      data.precioPersonalizado || '',
      JSON.stringify(data.opcionales || []),
      data.notas || '',
      JSON.stringify(data.modelo || {})
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, id: data.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    
    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const presupuestos = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      presupuestos.push({
        id: r[0] || '',
        numPresupuesto: r[1] || '',
        fecha: r[2] || '',
        fechaCreacion: r[3] || '',
        cliente: {
          nombre: r[4] || '',
          direccion: r[5] || '',
          telefono: r[6] || '',
          email: r[7] || ''
        },
        marca: {
          id: r[8] || '',
          nombre: r[9] || ''
        },
        modelo: JSON.parse(r[15] || '{}'),
        precioPersonalizado: r[12] || null,
        opcionales: JSON.parse(r[13] || '[]'),
        notas: r[14] || ''
      });
    }

    if (e.parameter.id) {
      const found = presupuestos.find(p => p.id === e.parameter.id);
      return ContentService
        .createTextOutput(JSON.stringify(found || null))
        .setMimeType(ContentService.MimeType.JSON);
    }

    presupuestos.sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || ''));
    
    return ContentService
      .createTextOutput(JSON.stringify(presupuestos))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
