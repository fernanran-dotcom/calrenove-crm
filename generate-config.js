// Genera config.js desde variables de entorno para Vercel
const fs = require('fs');
const url = process.env.GS_WEBAPP_URL || 'AQUI_PON_LA_URL_DEL_WEB_APP';
const content = `const CONFIG = {\n  googleSheetsWebAppUrl: '${url}'\n};\n`;
fs.writeFileSync('config.js', content, 'utf8');
console.log('config.js generado con:', url);
