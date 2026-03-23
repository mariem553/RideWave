/* ═══════════════════════════════════════════════════════════
   admin-reservations.js — RideWave Admin
   Chemin : public/js/admin-reservations.js
   ═══════════════════════════════════════════════════════════ */
'use strict';

const API_RESERVATIONS = '/api/admin/reservations';
const API_ANNULER      = '/api/reservations';
const LOGIN_PATH       = '/admin/login';
const USE_MOCK         = true;
const PER_PAGE         = 10;

const MOCK_DATA = [
  { id:1,  client:'Ahmed Ben Ali',   clientEmail:'ahmed@email.com',  voiture:'Toyota Corolla',    dateDebut:'2026-03-10', dateFin:'2026-03-13', totalPrix:255.00, statut:'confirmee' },
  { id:2,  client:'Sana Trabelsi',   clientEmail:'sana@email.com',   voiture:'Volkswagen Golf',   dateDebut:'2026-03-05', dateFin:'2026-03-07', totalPrix:190.00, statut:'annulee'   },
  { id:3,  client:'Ahmed Ben Ali',   clientEmail:'ahmed@email.com',  voiture:'Renault Clio',      dateDebut:'2026-04-01', dateFin:'2026-04-05', totalPrix:260.00, statut:'confirmee' },
  { id:4,  client:'Sana Trabelsi',   clientEmail:'sana@email.com',   voiture:'Peugeot 308',       dateDebut:'2026-04-10', dateFin:'2026-04-14', totalPrix:440.00, statut:'confirmee' },
  { id:5,  client:'Ahmed Ben Ali',   clientEmail:'ahmed@email.com',  voiture:'Dacia Sandero',     dateDebut:'2026-04-20', dateFin:'2026-04-22', totalPrix:110.00, statut:'annulee'   },
  { id:6,  client:'Sana Trabelsi',   clientEmail:'sana@email.com',   voiture:'Toyota Corolla',    dateDebut:'2026-05-01', dateFin:'2026-05-04', totalPrix:255.00, statut:'confirmee' },
  { id:7,  client:'Ahmed Ben Ali',   clientEmail:'ahmed@email.com',  voiture:'Volkswagen Golf',   dateDebut:'2026-05-10', dateFin:'2026-05-13', totalPrix:285.00, statut:'confirmee' },
  { id:8,  client:'Sana Trabelsi',   clientEmail:'sana@email.com',   voiture:'Renault Clio',      dateDebut:'2026-05-20', dateFin:'2026-05-22', totalPrix:130.00, statut:'annulee'   },
  { id:9,  client:'Ahmed Ben Ali',   clientEmail:'ahmed@email.com',  voiture:'Peugeot 308',       dateDebut:'2026-06-01', dateFin:'2026-06-06', totalPrix:550.00, statut:'confirmee' },
  { id:10, client:'Sana Trabelsi',   clientEmail:'sana@email.com',   voiture:'Dacia Sandero',     dateDebut:'2026-06-10', dateFin:'2026-06-12', totalPrix:110.00, statut:'confirmee' },
  { id:11, client:'Ahmed Ben Ali',   clientEmail:'ahmed@email.com',  voiture:'Toyota Corolla',    dateDebut:'2026-06-20', dateFin:'2026-06-23', totalPrix:255.00, statut:'annulee'   },
  { id:12, client:'Sana Trabelsi',   clientEmail:'sana@email.com',   voiture:'Volkswagen Golf',   dateDebut:'2026-07-01', dateFin:'2026-07-05', totalPrix:380.00, statut:'confirmee' },
];

/* ════════════════════════════
   AUTH
════════════════════════════ */
function getToken()  { return localStorage.getItem('adminToken'); }
function checkAuth() {
  if (!getToken()) { window.location.href = LOGIN_PATH; return null; }
  return getToken();
}
function logout() {
  localStorage.removeItem('adminToken');
  window.location.href = LOGIN_PATH;
}

/* ════════════════════════════
   STATE
════════════════════════════ */
let allData      = [];
let filteredData = [];
let currentPage  = 1;
let cancelTarget = null;

/* ════════════════════════════
   API
════════════════════════════ */
async function fetchReservations(token) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 500));
    return { reservations: MOCK_DATA, total: MOCK_DATA.length };
  }
  const res = await fetch(API_RESERVATIONS, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (res.status === 401 || res.status === 403) { logout(); return null; }
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function patchAnnuler(token, id) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    const r = allData.find(x => x.id === id);
    if (r) r.statut = 'annulee';
    return true;
  }
  const res = await fetch(`${API_ANNULER}/${id}/annuler`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`PATCH ${res.status}`);
  return true;
}

/* ════════════════════════════
   HELPERS
════════════════════════════ */
const fmtDate  = s => {
  if (!s) return '—';
  const date = new Date(s);
  return `${String(date.getUTCDate()).padStart(2,'0')}/${String(date.getUTCMonth()+1).padStart(2,'0')}/${date.getUTCFullYear()}`;
};

/* ── NOUVEAU : calcul durée ── */
const duree = (d1, d2) => {
  if (!d1 || !d2) return '—';
  const n = Math.round((new Date(d2) - new Date(d1)) / 86400000);
  return n > 0 ? `${n} nuit${n > 1 ? 's' : ''}` : '—';
};

const fmtPrix  = n => `${Number(n).toFixed(2)} TND`;
const initials = n => n.split(' ').map(x => x[0]).join('').substring(0,2).toUpperCase();
const esc      = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const bCls     = s => s === 'confirmee' ? 'b-ok' : 'b-ko';
const bLbl     = s => s === 'confirmee' ? 'Confirmée' : 'Annulée';

/* ════════════════════════════
   FILTRAGE
════════════════════════════ */
function applyFilters() {
  const search   = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
  const statut   = document.querySelector('.ftab.active')?.dataset.val || '';
  const dateFrom = document.getElementById('dateFrom')?.value || '';
  const dateTo   = document.getElementById('dateTo')?.value   || '';

  filteredData = allData.filter(r => {
    const matchSearch = !search ||
      r.client.toLowerCase().includes(search) ||
      r.voiture.toLowerCase().includes(search) ||
      String(r.id).includes(search);
    const matchStatut = !statut || r.statut === statut;
    const d = r.dateDebut;
    const matchFrom = !dateFrom || d >= dateFrom;
    const matchTo   = !dateTo   || d <= dateTo;
    return matchSearch && matchStatut && matchFrom && matchTo;
  });

  currentPage = 1;
  renderTable();
  renderPagination();
  renderSummary();
}

/* ════════════════════════════
   RENDER TABLE
   MODIFS :
   - Ajout colonne Durée
   - Couleur total → var(--accent-light)
   - colspan 8 → 9
════════════════════════════ */
function renderTable() {
  const tbody = document.getElementById('tbody');
  const count = document.getElementById('tcCount');
  if (!tbody) return;

  const total = filteredData.length;
  const start = (currentPage - 1) * PER_PAGE;
  const page  = filteredData.slice(start, start + PER_PAGE);

  if (count) count.textContent = `${total} entrée${total > 1 ? 's' : ''}`;

  if (!total) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9">
          <div class="no-results">
            <div class="no-results-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div class="no-results-text">Aucune réservation trouvée</div>
            <div class="no-results-sub">Essayez de modifier vos filtres</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = page.map((r, i) => `
    <tr style="animation-delay:${i * 0.04}s">
      <td><span class="td-id">#${r.id}</span></td>
      <td>
        <div class="td-client">
          <div class="cl-av">${esc(initials(r.client))}</div>
          <div>
            <div class="cl-name">${esc(r.client)}</div>
            <div class="cl-email">${esc(r.clientEmail || '')}</div>
          </div>
        </div>
      </td>
      <td class="td-car">${esc(r.voiture)}</td>
      <td class="td-date">${fmtDate(r.dateDebut)}</td>
      <td class="td-date">${fmtDate(r.dateFin)}</td>
      <td class="td-duree">${duree(r.dateDebut, r.dateFin)}</td>
      <td class="td-prix">${fmtPrix(r.totalPrix)}</td>
      <td><span class="badge ${bCls(r.statut)}">${bLbl(r.statut)}</span></td>
      <td>
        ${r.statut === 'confirmee'
          ? `<button class="btn-annuler" data-id="${r.id}">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <circle cx="12" cy="12" r="10"/>
                 <line x1="15" y1="9" x2="9" y2="15"/>
                 <line x1="9" y1="9" x2="15" y2="15"/>
               </svg>
               Annuler
             </button>`
          : `<span class="td-action-empty">—</span>`
        }
      </td>
    </tr>`).join('');

  tbody.querySelectorAll('.btn-annuler').forEach(btn => {
    btn.addEventListener('click', () => openModal(parseInt(btn.dataset.id)));
  });
}

/* ════════════════════════════
   PAGINATION
════════════════════════════ */
function renderPagination() {
  const pg = document.getElementById('pagination');
  if (!pg) return;

  const total = filteredData.length;
  const pages = Math.ceil(total / PER_PAGE);

  if (pages <= 1) { pg.innerHTML = ''; return; }

  let html = '';
  html += `<button class="pg-btn" id="pgPrev" ${currentPage === 1 ? 'disabled' : ''}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  </button>`;

  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - currentPage) <= 1) {
      html += `<button class="pg-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (Math.abs(i - currentPage) === 2) {
      html += `<span style="color:var(--muted);font-size:12px;padding:0 2px">…</span>`;
    }
  }

  html += `<button class="pg-btn" id="pgNext" ${currentPage === pages ? 'disabled' : ''}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  </button>`;

  pg.innerHTML = html;

  pg.querySelector('#pgPrev')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderTable(); renderPagination(); scrollToTable(); }
  });
  pg.querySelector('#pgNext')?.addEventListener('click', () => {
    if (currentPage < pages) { currentPage++; renderTable(); renderPagination(); scrollToTable(); }
  });
  pg.querySelectorAll('.pg-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderTable(); renderPagination(); scrollToTable();
    });
  });
}

function scrollToTable() {
  document.querySelector('.table-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════════════════════════
   RÉSUMÉ
════════════════════════════ */
function renderSummary() {
  const el  = document.getElementById('resultsSummary');
  if (!el) return;
  const total = filteredData.length;
  const all   = allData.length;
  if (total === all) {
    el.innerHTML = `<strong>${total}</strong> réservation${total>1?'s':''} au total`;
  } else {
    el.innerHTML = `<strong>${total}</strong> résultat${total>1?'s':''} sur ${all} réservations`;
  }
}

/* ════════════════════════════
   MODAL ANNULATION
════════════════════════════ */
function openModal(id) {
  cancelTarget = id;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() {
  cancelTarget = null;
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('btnModalConfirm').classList.remove('loading');
  document.getElementById('btnModalConfirm').textContent = "Confirmer l'annulation";
}

async function confirmAnnulation() {
  if (!cancelTarget) return;
  const token = getToken(); if (!token) return;
  const btn = document.getElementById('btnModalConfirm');
  btn.classList.add('loading');
  btn.textContent = 'Annulation…';
  try {
    await patchAnnuler(token, cancelTarget);
    closeModal();
    applyFilters();
    showToast('Réservation annulée avec succès', 'success');
  } catch(e) {
    closeModal();
    showToast("Erreur lors de l'annulation", 'error');
    console.error('[RideWave]', e);
  }
}

/* ════════════════════════════
   TOAST
════════════════════════════ */
function showToast(msg, type = 'success') {
  const icon = type === 'success'
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icon}</span>${esc(msg)}`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => t.remove(), 320);
  }, 3000);
}

/* ════════════════════════════
   LOADING
════════════════════════════ */
function hideLoading() {
  const el = document.getElementById('loading-screen');
  if (!el) return;
  el.classList.add('hidden');
  setTimeout(() => el.remove(), 520);
}

/* ════════════════════════════
   INIT
════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  if (!getToken()) localStorage.setItem('adminToken', 'demo-token');
  const token = checkAuth();
  if (!token) return;

  const tDate = document.getElementById('tDate');
  if (tDate) tDate.textContent = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const searchInput = document.getElementById('searchInput');
  const btnClear    = document.getElementById('btnClear');

  searchInput?.addEventListener('input', () => {
    btnClear?.classList.toggle('visible', searchInput.value.length > 0);
    applyFilters();
  });
  btnClear?.addEventListener('click', () => {
    searchInput.value = '';
    btnClear.classList.remove('visible');
    searchInput.focus();
    applyFilters();
  });

  document.getElementById('filterStatut')?.addEventListener('click', e => {
    const btn = e.target.closest('.ftab');
    if (!btn) return;
    document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    applyFilters();
  });

  document.getElementById('dateFrom')?.addEventListener('change', applyFilters);
  document.getElementById('dateTo')?.addEventListener('change', applyFilters);

  document.getElementById('btnResetFilters')?.addEventListener('click', () => {
    if (searchInput) { searchInput.value = ''; btnClear?.classList.remove('visible'); }
    document.querySelectorAll('.ftab').forEach(t => t.classList.remove('active'));
    document.querySelector('.ftab[data-val=""]')?.classList.add('active');
    if (document.getElementById('dateFrom')) document.getElementById('dateFrom').value = '';
    if (document.getElementById('dateTo'))   document.getElementById('dateTo').value   = '';
    applyFilters();
  });

  document.getElementById('btnRefresh')?.addEventListener('click', async () => {
    const svg = document.querySelector('#btnRefresh svg');
    if (svg) svg.style.animation = 'spin .6s linear infinite';
    try {
      const data = await fetchReservations(token);
      if (data) { allData = data.reservations || []; filteredData = [...allData]; applyFilters(); }
    } catch(e) { console.error('[RideWave]', e); }
    finally { if (svg) svg.style.animation = ''; }
  });

  document.getElementById('btnLogout')?.addEventListener('click', logout);

  document.getElementById('mobileToggle')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('toggleSidebar'));
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sbOverlay')?.classList.toggle('on');
  });

  document.getElementById('btnModalCancel')?.addEventListener('click', closeModal);
  document.getElementById('btnModalConfirm')?.addEventListener('click', confirmAnnulation);
  document.getElementById('modalOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  try {
    const data = await fetchReservations(token);
    if (data) {
      allData      = data.reservations || [];
      filteredData = [...allData];
      renderTable();
      renderPagination();
      renderSummary();
    }
  } catch(e) {
    console.error('[RideWave reservations]', e);
  } finally {
    hideLoading();
  }
});