// CAMBIA ESTA URL POR EL DOMINIO QUE TE GENERE RAILWAY (terminando en /api)
const API_BASE_URL = 'https://api-peliculas-node-production.up.railway.app/api';

const currentModule = document.body.dataset.module;
let editingId = null;

// Configuración de columnas y campos según las tablas de peliculas_api
const moduleConfig = {
  directores: {
    endpoint: '/directores',
    columns: ['id', 'nombres', 'estado'],
    fields: ['nombres', 'estado']
  },
  generos: {
    endpoint: '/generos',
    columns: ['id', 'nombre', 'descripcion', 'estado'],
    fields: ['nombre', 'descripcion', 'estado']
  },
  productoras: {
    endpoint: '/productoras',
    columns: ['id', 'nombre', 'slogan', 'descripcion', 'estado'],
    fields: ['nombre', 'slogan', 'descripcion', 'estado']
  },
  tipos: {
    endpoint: '/tipos',
    columns: ['id', 'nombre', 'descripcion'],
    fields: ['nombre', 'descripcion']
  },
  media: {
    endpoint: '/media',
    columns: ['serial', 'titulo', 'sinopsis', 'anio_estreno'],
    fields: ['serial', 'titulo', 'sinopsis', 'url', 'imagen', 'anio_estreno', 'genero_id', 'director_id', 'productora_id', 'tipo_id']
  }
};

// Listas desplegables del formulario de media (se llenan desde la API)
const selectOptions = {
  genero_id: { endpoint: '/generos', label: 'nombre' },
  director_id: { endpoint: '/directores', label: 'nombres' },
  productora_id: { endpoint: '/productoras', label: 'nombre' },
  tipo_id: { endpoint: '/tipos', label: 'nombre' }
};

document.addEventListener('DOMContentLoaded', () => {
  if (currentModule === 'resumen') {
    cargarResumen();
  } else if (moduleConfig[currentModule]) {
    cargarTabla(currentModule);
    configurarFormulario(currentModule);
    if (currentModule === 'media') {
      cargarOpcionesSelect();
      iniciarSelectorAnio();
    }
  }
});

// ================= SERIAL AUTOMÁTICO (MEDIA) =================
// El backend asigna el serial al guardar; aquí solo se muestra el siguiente
async function mostrarSiguienteSerial() {
  const input = document.getElementById('input-serial');
  input.value = 'Calculando...';

  try {
    const res = await fetch(`${API_BASE_URL}/media/siguiente-serial`);
    const data = await res.json();
    input.value = data.serial;
  } catch (error) {
    input.value = '';
    console.error('Error obteniendo el serial:', error);
  }
}

// ================= SELECTOR DE AÑO (MEDIA) =================
// Rango del tipo YEAR de MySQL, limitado a 10 años en el futuro
const ANIO_MINIMO = 1901;
const ANIO_MAXIMO = new Date().getFullYear() + 10;

function iniciarSelectorAnio() {
  const input = document.getElementById('input-anio_estreno');
  const panel = document.getElementById('year-picker-panel');
  if (!input || !panel) return;

  let inicioPagina;

  const renderizar = () => {
    const seleccionado = Number(input.value);
    const actual = new Date().getFullYear();
    const fin = inicioPagina + 11;

    let html = `
      <div class="year-picker-header">
        <button type="button" class="year-picker-nav" data-paso="-12" ${inicioPagina <= ANIO_MINIMO ? 'disabled' : ''}>‹</button>
        <span>${inicioPagina} – ${fin}</span>
        <button type="button" class="year-picker-nav" data-paso="12" ${fin >= ANIO_MAXIMO ? 'disabled' : ''}>›</button>
      </div>
      <div class="year-picker-grid">
    `;

    for (let anio = inicioPagina; anio <= fin; anio++) {
      const clases = ['year-picker-year'];
      if (anio === seleccionado) clases.push('seleccionado');
      if (anio === actual) clases.push('actual');
      const fueraDeRango = anio < ANIO_MINIMO || anio > ANIO_MAXIMO;
      html += `<button type="button" class="${clases.join(' ')}" data-anio="${anio}" ${fueraDeRango ? 'disabled' : ''}>${anio}</button>`;
    }

    panel.innerHTML = html + '</div>';
  };

  input.addEventListener('click', () => {
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      return;
    }
    // Abre en la página de 12 años que contiene el año elegido (o el actual)
    const base = Number(input.value) || new Date().getFullYear();
    inicioPagina = base - ((base - ANIO_MINIMO) % 12);
    renderizar();
    panel.classList.add('open');
  });

  panel.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-paso]');
    const opcion = e.target.closest('[data-anio]');

    if (nav) {
      inicioPagina += Number(nav.dataset.paso);
      renderizar();
    } else if (opcion) {
      input.value = opcion.dataset.anio;
      panel.classList.remove('open');
    }
  });

  // Cierra el selector al hacer clic fuera o con Escape
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.year-picker')) panel.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') panel.classList.remove('open');
  });
}

// ================= LLENAR LISTAS DESPLEGABLES =================
// Los registros inactivos se muestran deshabilitados porque la API no los acepta
async function cargarOpcionesSelect() {
  await Promise.all(Object.entries(selectOptions).map(async ([field, option]) => {
    const select = document.getElementById(`input-${field}`);
    if (!select) return;

    try {
      const res = await fetch(`${API_BASE_URL}${option.endpoint}`);
      const data = await res.json();

      select.innerHTML = '<option value="" disabled selected>Selecciona...</option>' +
        data.map(item => {
          const inactivo = item.estado === 'Inactivo';
          return `<option value="${item.id}" ${inactivo ? 'disabled' : ''}>${item[option.label]}${inactivo ? ' (Inactivo)' : ''}</option>`;
        }).join('');
    } catch (error) {
      select.innerHTML = '<option value="" disabled selected>No se pudo cargar (¿backend apagado?)</option>';
      console.error(`Error cargando opciones de ${field}:`, error);
    }
  }));
}

// ================= 1. LISTAR DATOS EN TABLA (GET) =================
async function cargarTabla(modulo) {
  const config = moduleConfig[modulo];
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE_URL}${config.endpoint}`);
    const data = await res.json();
    tbody.innerHTML = '';

    data.forEach(item => {
      const tr = document.createElement('tr');
      let cellsHtml = '';

      config.columns.forEach(col => {
        if (col === 'estado') {
          const badgeClass = item.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo';
          cellsHtml += `<td><span class="badge ${badgeClass}"><span class="badge-dot"></span> ${item.estado}</span></td>`;
        } else if (col === 'nombre' || col === 'nombres' || col === 'titulo') {
          cellsHtml += `<td><strong>${item[col] || ''}</strong></td>`;
        } else {
          cellsHtml += `<td>${item[col] ?? '-'}</td>`;
        }
      });

      const itemEncoded = encodeURIComponent(JSON.stringify(item));
      cellsHtml += `
        <td style="text-align: right;">
          <button class="btn-action" onclick="editarRegistro('${itemEncoded}')" title="Editar">
            <i data-lucide="pencil" size="16"></i>
          </button>
          <button class="btn-action" onclick="eliminarRegistro(${item.id})" title="Eliminar">
            <i data-lucide="trash-2" size="16"></i>
          </button>
        </td>
      `;

      tr.innerHTML = cellsHtml;
      tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  } catch (error) {
    console.error(`Error cargando ${modulo}:`, error);
  }
}

// ================= 2. CREAR / ACTUALIZAR (POST / PUT) =================
function configurarFormulario(modulo) {
  const form = document.getElementById('api-form');
  const openBtn = document.getElementById('open-modal-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const modal = document.getElementById('modal');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      editingId = null;
      form.reset();
      if (modulo === 'media') mostrarSiguienteSerial();
      modal.classList.add('active');
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const config = moduleConfig[modulo];
    const payload = {};

    config.fields.forEach(field => {
      const input = document.getElementById(`input-${field}`);
      if (input) {
        const esNumerico = input.type === 'number' || field.endsWith('_id') || field === 'anio_estreno';
        payload[field] = esNumerico ? Number(input.value) : input.value;
      }
    });

    // Los campos readonly no los valida el navegador, por eso se revisa aquí
    if (modulo === 'media' && !payload.anio_estreno) {
      alert('Selecciona el año de estreno.');
      return;
    }

    const url = editingId
      ? `${API_BASE_URL}${config.endpoint}/${editingId}`
      : `${API_BASE_URL}${config.endpoint}`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        modal.classList.remove('active');
        form.reset();
        editingId = null;
        cargarTabla(modulo);
      } else {
        const err = await res.json();
        alert('Error al guardar: ' + (err.message || err.error || res.statusText));
      }
    } catch (error) {
      console.error('Error en petición:', error);
    }
  });
}

// ================= 3. ABRIR MODAL PARA EDITAR =================
window.editarRegistro = function (itemEncoded) {
  const item = JSON.parse(decodeURIComponent(itemEncoded));
  const config = moduleConfig[currentModule];
  const modal = document.getElementById('modal');
  editingId = item.id;

  config.fields.forEach(field => {
    const input = document.getElementById(`input-${field}`);
    if (input && item[field] !== undefined && item[field] !== null) {
      input.value = item[field];
    }
  });

  modal.classList.add('active');
};

// ================= 4. ELIMINAR REGISTRO (DELETE) =================
window.eliminarRegistro = async function (id) {
  if (!confirm('¿Estás seguro de eliminar este registro?')) return;
  const config = moduleConfig[currentModule];

  try {
    const res = await fetch(`${API_BASE_URL}${config.endpoint}/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) cargarTabla(currentModule);
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};

// ================= 5. RESUMEN (KPIS, CATÁLOGO Y BUSCADOR) =================
async function cargarResumen() {
  try {
    const [mediaRes, genRes, dirRes, prodRes] = await Promise.all([
      fetch(`${API_BASE_URL}/media`),
      fetch(`${API_BASE_URL}/generos`),
      fetch(`${API_BASE_URL}/directores`),
      fetch(`${API_BASE_URL}/productoras`)
    ]);

    const [media, generos, directores, productoras] = await Promise.all([
      mediaRes.json(), genRes.json(), dirRes.json(), prodRes.json()
    ]);

    if (document.getElementById('kpi-media')) document.getElementById('kpi-media').textContent = media.length;
    if (document.getElementById('kpi-generos')) document.getElementById('kpi-generos').textContent = generos.length;
    if (document.getElementById('kpi-directores')) document.getElementById('kpi-directores').textContent = directores.length;
    if (document.getElementById('kpi-productoras')) document.getElementById('kpi-productoras').textContent = productoras.length;

    renderizarCatalogo(media);

    const searchInput = document.getElementById('search-catalog');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtradas = media.filter(m =>
          (m.titulo && m.titulo.toLowerCase().includes(term)) ||
          (m.serial && m.serial.toLowerCase().includes(term))
        );
        renderizarCatalogo(filtradas);
      });
    }
  } catch (error) {
    console.error('Error cargando resumen:', error);
  }
}

function renderizarCatalogo(lista) {
  const grid = document.getElementById('media-grid');
  if (!grid || !Array.isArray(lista)) return;

  grid.innerHTML = lista.map(m => `
    <div class="media-card">
      <span class="media-badge">• ${m.serial}</span>
      <img src="${m.imagen || 'https://picsum.photos/300/450'}" alt="${m.titulo}" class="media-poster">
      <div class="media-body">
        <div class="media-title">${m.titulo}</div>
        <div class="media-meta">
          <span>${m.sinopsis ? m.sinopsis.substring(0, 32) + '...' : 'Sin descripción'}</span>
          <span>${m.anio_estreno}</span>
        </div>
      </div>
    </div>
  `).join('');
}