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

document.addEventListener('DOMContentLoaded', () => {
  if (currentModule === 'resumen') {
    cargarResumen();
  } else if (moduleConfig[currentModule]) {
    cargarTabla(currentModule);
    configurarFormulario(currentModule);
  }
});

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
        payload[field] = input.type === 'number' ? Number(input.value) : input.value;
      }
    });

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