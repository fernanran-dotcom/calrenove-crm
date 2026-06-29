const App = {
  gsConnected: false,

  init() {
    this.checkAuth();
    this.testGSConnection();
  },

  checkAuth() {
    const path = window.location.pathname;
    if (localStorage.getItem('calrenove_logged') !== 'true') {
      if (!path.endsWith('login.html') && !path.endsWith('/login') && path !== '/') {
        window.location.href = 'login.html';
      }
    }
  },

  login(usuario, password) {
    if (usuario === 'andoni' && password === 'alba') {
      localStorage.setItem('calrenove_logged', 'true');
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem('calrenove_logged');
    window.location.href = 'login.html';
  },

  generarNumPresupuesto() {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const dd = now.getDate().toString().padStart(2, '0');
    const key = `calrenove_seq_${yy}${mm}${dd}`;
    const seq = (parseInt(localStorage.getItem(key) || '0') + 1);
    localStorage.setItem(key, seq.toString());
    return `${yy}${mm}${dd}${seq.toString().padStart(2, '0')}`;
  },

  formatearFecha() {
    const now = new Date();
    return `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  },

  getGSWebAppUrl() {
    return typeof CONFIG !== 'undefined' ? CONFIG.googleSheetsWebAppUrl : null;
  },

  async testGSConnection() {
    const url = this.getGSWebAppUrl();
    if (!url || url === 'AQUI_PON_LA_URL_DEL_WEB_APP') {
      this.gsConnected = false;
      this.actualizarEstadoGS();
      return;
    }
    try {
      const res = await fetch(url, { method: 'HEAD', mode: 'cors' });
      this.gsConnected = res.ok;
    } catch {
      this.gsConnected = false;
    }
    this.actualizarEstadoGS();
  },

  actualizarEstadoGS() {
    document.querySelectorAll('.gs-status').forEach(el => {
      if (this.gsConnected) {
        el.innerHTML = '<span style="color:#28a745;font-size:12px;">\u25CF Google Sheets conectado</span>';
      } else {
        el.innerHTML = '<span style="color:#dc3545;font-size:12px;">\u25CF Sin conexión Google Sheets</span>';
      }
    });
  },

  async guardarPresupuesto(data) {
    const presupuestos = this.getPresupuestos();
    const id = `PRE-${data.numPresupuesto}-${Date.now()}`;
    data.id = id;
    data.fechaCreacion = new Date().toISOString();
    presupuestos.unshift(data);
    localStorage.setItem('calrenove_presupuestos', JSON.stringify(presupuestos));
    this.syncToGoogleSheets(data);
    return id;
  },

  async syncToGoogleSheets(data) {
    const url = this.getGSWebAppUrl();
    if (!url || url === 'AQUI_PON_LA_URL_DEL_WEB_APP') return;
    try {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) this.gsConnected = true;
    } catch {
      this.gsConnected = false;
    }
    this.actualizarEstadoGS();
  },

  async loadFromGoogleSheets() {
    const url = this.getGSWebAppUrl();
    if (!url || url === 'AQUI_PON_LA_URL_DEL_WEB_APP') return [];
    try {
      const res = await fetch(url, { mode: 'cors' });
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async getAllPresupuestos() {
    const local = this.getPresupuestos();
    const cloud = await this.loadFromGoogleSheets();
    const merged = [...local];
    for (const cp of cloud) {
      if (!merged.find(p => p.id === cp.id)) merged.push(cp);
    }
    merged.sort((a, b) => (b.fechaCreacion || '').localeCompare(a.fechaCreacion || ''));
    return merged;
  },

  async getPresupuesto(id) {
    const local = this.getPresupuestos().find(p => p.id === id);
    if (local) return local;
    const url = this.getGSWebAppUrl();
    if (!url || url === 'AQUI_PON_LA_URL_DEL_WEB_APP') return null;
    try {
      const res = await fetch(`${url}?id=${encodeURIComponent(id)}`, { mode: 'cors' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  getPresupuestos() {
    return JSON.parse(localStorage.getItem('calrenove_presupuestos') || '[]');
  },

  getEmpresa(id) {
    return EMPRESAS.find(e => e.id === id) || EMPRESAS[0];
  },

  renderPresupuesto(presupuesto, containerId) {
    const modelo = presupuesto.modelo;
    if (!modelo || !modelo.precioFinal) {
      document.getElementById(containerId).innerHTML = '<p style="color:#dc3545;">Error: datos del presupuesto incompletos</p>';
      return;
    }

    const emp = presupuesto.empresa ? this.getEmpresa(presupuesto.empresa) : EMPRESAS[0];
    const precio = presupuesto.precioPersonalizado ? parseFloat(presupuesto.precioPersonalizado) : modelo.precioFinal;
    const iva = precio * 0.21;
    const total = precio + iva;
    const c = emp.color;
    const cl = emp.colorLight;

    const formato = (n) => (typeof n === 'number' ? n.toFixed(2) : parseFloat(n).toFixed(2)).replace('.', ',');

    let html = `
      <style>
        #p${containerId} .emp-header { border-bottom: 3px solid ${c}; }
        #p${containerId} .emp-header h1 { color: ${c}; }
        #p${containerId} .emp-num { color: ${c}; }
        #p${containerId} .emp-cliente h3 { color: ${c}; }
        #p${containerId} .tabla-precios th { background: ${c}; }
        #p${containerId} .emp-titulo { color: ${c}; }
        #p${containerId} .emp-footer { border-top: 2px solid ${c}; }
      </style>
      <div class="presupuesto-print" id="p${containerId}">
        <div class="presupuesto-header emp-header">
          <div class="empresa-info">
            <img src="${emp.logo}" alt="${emp.nombre}" style="max-height:60px;margin-bottom:8px;display:block;" onerror="this.style.display='none'">

            ${emp.direccion ? '<p>' + emp.direccion + '</p>' : ''}
          </div>
          <div class="presupuesto-info">
            <div class="num emp-num">PRESUPUESTO Nº: ${presupuesto.numPresupuesto}</div>
            <div class="fecha">Fecha: ${presupuesto.fecha}</div>
          </div>
        </div>

        <div class="presupuesto-cliente emp-cliente">
          <h3>DATOS DEL CLIENTE</h3>
          <p><strong>${presupuesto.cliente.nombre || ''}</strong><br>
          ${presupuesto.cliente.direccion ? presupuesto.cliente.direccion + '<br>' : ''}
          ${presupuesto.cliente.telefono ? 'Tel.: ' + presupuesto.cliente.telefono : ''}
          ${presupuesto.cliente.email ? ' | Email: ' + presupuesto.cliente.email : ''}</p>
        </div>

        <div class="descripcion-item">
          <strong>DESCRIPCIÓN:</strong><br>
          Suministro e instalación de ${modelo.descripcion || modelo.nombre}
          Se incluyen los tramos de chimenea y materiales para su instalación, así como el transporte a vertedero autorizado de la caldera retirada.
        </div>

        <table class="tabla-precios">
          <thead><tr><th>Concepto</th><th style="width:80px;">Ud.</th><th style="width:140px;" class="precio-derecha">Precio</th><th style="width:140px;" class="precio-derecha">Total</th></tr></thead>
          <tbody>
            <tr><td>${modelo.nombre}</td><td>1</td><td class="precio-derecha">${formato(precio)} EUR</td><td class="precio-derecha">${formato(precio)} EUR</td></tr>`;

    if (presupuesto.opcionales && presupuesto.opcionales.length > 0) {
      presupuesto.opcionales.forEach(opt => {
        const optData = (modelo.opcionales||[]).find(o => o.nombre === opt);
        if (optData) {
          html += `<tr><td>Opcional: ${optData.nombre}</td><td>1</td><td class="precio-derecha">${formato(optData.precio)} EUR</td><td class="precio-derecha">${formato(optData.precio)} EUR</td></tr>`;
        }
      });
    }

    html += `
            <tr><td colspan="3" style="text-align:right;font-weight:600;">SUB-TOTAL</td><td class="precio-derecha">${formato(precio)} EUR</td></tr>
            <tr><td colspan="3" style="text-align:right;">IVA 21%</td><td class="precio-derecha">${formato(iva)} EUR</td></tr>
            <tr class="total-row"><td colspan="3" style="text-align:right;">TOTAL</td><td class="precio-derecha">${formato(total)} EUR</td></tr>
          </tbody>
        </table>`;

    if (modelo.incluye && modelo.incluye.length > 0) {
      html += `<div class="incluye-no-incluye"><div><h4 style="color:#28a745;margin-bottom:8px;">INCLUYE</h4><ul class="incluye-list">`;
      modelo.incluye.forEach(i => { html += `<li>${i}</li>`; });
      html += `</ul></div>`;
      if (modelo.noIncluye && modelo.noIncluye.length > 0) {
        html += `<div><h4 style="color:#dc3545;margin-bottom:8px;">NO INCLUYE</h4><ul class="no-incluye-list">`;
        modelo.noIncluye.forEach(i => { html += `<li>${i}</li>`; });
        html += `</ul></div>`;
      }
      html += `</div>`;
    }

    if (modelo.notas) {
      html += `<div class="notas-presupuesto"><strong>Nota:</strong> ${modelo.notas}</div>`;
    }
    if (presupuesto.notas) {
      html += `<div class="notas-presupuesto"><strong>Observaciones:</strong><br>${presupuesto.notas.replace(/\n/g, '<br>')}</div>`;
    }

    html += `
        <div class="firma-section">
          <div><div class="linea">Firma del cliente</div></div>
          <div><div class="linea">${emp.nombre}</div></div>
        </div>
        <div class="presupuesto-footer emp-footer">
          <p>${emp.nombre}</p>
          <p>Presupuesto válido durante 30 días</p>
        </div>
      </div>`;

    document.getElementById(containerId).innerHTML = html;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
