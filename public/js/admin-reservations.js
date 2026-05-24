/* ═══════════════════════════════════════════════════════════
   admin-reservations.js — RideWave Admin Réservations
   Description :
   - charge la liste des réservations depuis l'API admin
   - fournit recherche, filtres et pagination côté UI
   - calcule les statuts effectifs et le résumé des résultats
   - gère l'annulation d'une réservation avec confirmation
   - peut basculer entre données mock et API réelle
   ═══════════════════════════════════════════════════════════ */
'use strict';

/* ── Config API ──
   Adaptez ces deux constantes à votre backend :
   API_ANNULER_METHOD : méthode HTTP utilisée par votre route d'annulation
   API_ANNULER_PATH   : chemin de la route, {id} sera remplacé par l'id réel
   Exemples courants :
     PATCH  /api/reservations/{id}/annuler
     PUT    /api/reservations/{id}/annuler
     PATCH  /api/admin/reservations/{id}/cancel
     DELETE /api/reservations/{id}
*/
const API_RESERVATIONS     = '/api/admin/reservations';
const API_ANNULER_METHOD   = 'PATCH';                          // ← ajustez si besoin
const API_ANNULER_PATH = '/api/admin/reservations/{id}/annuler'; // ← ajustez si besoin

const USE_MOCK  = false;
const PER_PAGE  = 10;

/* ── Données mock ── */
const MOCK_DATA = [
  { id:1,  client:'Ahmed Ben Ali',  clientEmail:'ahmed@email.com',   marque:'Toyota',     modele:'Corolla', dateDebut:'2026-01-10', dateFin:'2026-01-13', totalPrix:255.00, statut:'confirmee' },
  { id:2,  client:'Sana Trabelsi',  clientEmail:'sana@email.com',    marque:'Volkswagen', modele:'Golf',    dateDebut:'2026-01-05', dateFin:'2026-01-07', totalPrix:190.00, statut:'annulee'   },
  { id:3,  client:'Karim Mansouri', clientEmail:'karim@email.com',   marque:'Renault',    modele:'Clio',    dateDebut:'2026-02-01', dateFin:'2026-02-05', totalPrix:260.00, statut:'confirmee' },
  { id:4,  client:'Nadia Bouaziz',  clientEmail:'nadia@email.com',   marque:'Peugeot',    modele:'308',     dateDebut:'2026-02-12', dateFin:'2026-02-16', totalPrix:440.00, statut:'confirmee' },
  { id:5,  client:'Youssef Hamdi',  clientEmail:'youssef@email.com', marque:'Dacia',      modele:'Sandero', dateDebut:'2026-03-20', dateFin:'2026-03-22', totalPrix:110.00, statut:'annulee'   },
  { id:6,  client:'Sana Trabelsi',  clientEmail:'sana@email.com',    marque:'Toyota',     modele:'Corolla', dateDebut:'2026-04-15', dateFin:'2026-04-18', totalPrix:255.00, statut:'confirmee' },
  { id:7,  client:'Ahmed Ben Ali',  clientEmail:'ahmed@email.com',   marque:'Volkswagen', modele:'Golf',    dateDebut:'2026-05-10', dateFin:'2026-05-13', totalPrix:285.00, statut:'confirmee' },
  { id:8,  client:'Sana Trabelsi',  clientEmail:'sana@email.com',    marque:'Renault',    modele:'Clio',    dateDebut:'2026-05-20', dateFin:'2026-05-22', totalPrix:130.00, statut:'annulee'   },
  { id:9,  client:'Ahmed Ben Ali',  clientEmail:'ahmed@email.com',   marque:'Peugeot',    modele:'308',     dateDebut:'2026-06-01', dateFin:'2026-06-06', totalPrix:550.00, statut:'confirmee' },
  { id:10, client:'Sana Trabelsi',  clientEmail:'sana@email.com',    marque:'Dacia',      modele:'Sandero', dateDebut:'2026-06-10', dateFin:'2026-06-12', totalPrix:110.00, statut:'confirmee' },
  { id:11, client:'Ahmed Ben Ali',  clientEmail:'ahmed@email.com',   marque:'Toyota',     modele:'Corolla', dateDebut:'2026-06-20', dateFin:'2026-06-23', totalPrix:255.00, statut:'annulee'   },
  { id:12, client:'Sana Trabelsi',  clientEmail:'sana@email.com',    marque:'Volkswagen', modele:'Golf',    dateDebut:'2026-07-01', dateFin:'2026-07-05', totalPrix:380.00, statut:'confirmee' },
  { id:13, client:'Karim Mansouri', clientEmail:'karim@email.com',   marque:'Dacia',      modele:'Sandero', dateDebut:'2026-08-01', dateFin:'2026-08-04', totalPrix:165.00, statut:'confirmee' },
];

/* ── État global ── */
let allData      = [];
let filteredData = [];
let currentPage  = 1;
let cancelTarget = null;

/* ════════════════════════════
   STATUT EFFECTIF
   La BD ne stocke que 'confirmee' / 'annulee'.
   On calcule 'terminee' côté front : dateFin passée + non annulée.
════════════════════════════ */
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function effectiveStatut(r) {
  if (r.statut === 'annulee') return 'annulee';
  if (r.dateFin && r.dateFin < TODAY_ISO) return 'terminee';
  return 'confirmee';
}

function canCancel(r) {
  return r.statut === 'confirmee' && r.dateDebut >= TODAY_ISO;
}

/* ════════════════════════════
   WRAPPERS SÉCURISÉS
════════════════════════════ */
function safeGetToken() {
  try { return typeof getAdminToken === 'function' ? getAdminToken() : null; }
  catch(e) { return null; }
}

function safeShowToast(msg, type) {
  try {
    if (typeof showToast === 'function') { showToast(msg, type); return; }
  } catch(e) { /* ignore */ }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = '<span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + (type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>')
    + '</svg></span><span>' + msg + '</span>';
  document.body.appendChild(el);
  setTimeout(() => { el.style.animation = 'toastOut 0.3s ease forwards'; setTimeout(() => el.remove(), 300); }, 3500);
}

/* ════════════════════════════
   API
════════════════════════════ */
async function fetchReservations() {
  if (USE_MOCK) {
    await new Promise(res => setTimeout(res, 500));
    return { reservations: MOCK_DATA };
  }
  const token = safeGetToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_RESERVATIONS, { headers });
  if (res.status === 401 || res.status === 403) {
    if (typeof adminLogout === 'function') adminLogout();
    return null;
  }
  if (!res.ok) throw new Error('Erreur serveur ' + res.status);
  return res.json();
}

async function patchAnnuler(id) {
  
  if (USE_MOCK) {
    await new Promise(res => setTimeout(res, 600));
    const r = allData.find(x => x.id === id);
    if (r) r.statut = 'annulee';
    return true;
  }

  const token   = safeGetToken();
  const url     = API_ANNULER_PATH.replace('{id}', id);
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res;
  try {
    res = await fetch(url, { method: API_ANNULER_METHOD, headers });
  } catch (networkErr) {
    console.error('[RideWave] Erreur réseau annulation :', networkErr);
    throw new Error('Impossible de contacter le serveur');
  }

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch(e) { /* ignore */ }
    console.error('[RideWave] ' + API_ANNULER_METHOD + ' ' + url + ' → ' + res.status, detail);
    throw new Error('Erreur ' + res.status + (detail ? ' : ' + detail.substring(0,120) : ''));
  }

  const r = allData.find(x => x.id === id);
  if (r) r.statut = 'annulee';
  return true;
}

/* ════════════════════════════
   HELPERS AFFICHAGE
════════════════════════════ */
const esc        = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtDate    = s => { if (!s) return '—'; const d = new Date(s); return String(d.getUTCDate()).padStart(2,'0') + '/' + String(d.getUTCMonth()+1).padStart(2,'0') + '/' + d.getUTCFullYear(); };
const duree      = (d1,d2) => { if (!d1||!d2) return '—'; const n=Math.round((new Date(d2)-new Date(d1))/86400000); return n>0 ? n+' nuit'+(n>1?'s':'') : '—'; };
const fmtPrix    = n => Number(n).toFixed(2) + ' TND';
const initials   = n => n.split(' ').map(x=>x[0]).join('').substring(0,2).toUpperCase();
const nomVoiture = r => esc((r.marque||'') + ' ' + (r.modele||''));

function bCls(statut) {
  if (statut === 'confirmee') return 'b-ok';
  if (statut === 'annulee')   return 'b-ko';
  if (statut === 'terminee')  return 'b-done';
  return 'b-wait';
}
function bLbl(statut) {
  if (statut === 'confirmee') return 'Confirmée';
  if (statut === 'annulee')   return 'Annulée';
  if (statut === 'terminee')  return 'Terminée';
  return statut || '—';
}

/* ════════════════════════════
   FILTRAGE
════════════════════════════ */
function applyFilters() {
  const search   = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
  const statut   = document.querySelector('#filterStatut .ftab.active')?.dataset.val || '';
  const dateFrom = document.getElementById('dateFrom')?.value || '';
  const dateTo   = document.getElementById('dateTo')?.value   || '';

  filteredData = allData.filter(r => {
    const voiture     = (r.marque + ' ' + r.modele).toLowerCase();
    const matchSearch = !search || r.client.toLowerCase().includes(search) || voiture.includes(search) || String(r.id).includes(search);
    const matchStatut = !statut || effectiveStatut(r) === statut;
    const matchFrom   = !dateFrom || r.dateDebut >= dateFrom;
    const matchTo     = !dateTo   || r.dateDebut <= dateTo;
    return matchSearch && matchStatut && matchFrom && matchTo;
  });

  currentPage = 1;
  renderTable();
  renderPagination();
  renderSummary();
}

/* ════════════════════════════
   RENDER TABLE
════════════════════════════ */
function renderTable() {
  const tbody = document.getElementById('tbody');
  const count = document.getElementById('tcCount');
  if (!tbody) return;

  const total = filteredData.length;
  const start = (currentPage - 1) * PER_PAGE;
  const page  = filteredData.slice(start, start + PER_PAGE);

  if (count) count.textContent = total + ' entrée' + (total>1?'s':'');

  if (!total) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="no-results">'
      + '<div class="no-results-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>'
      + '<div class="no-results-text">Aucune réservation trouvée</div>'
      + '<div class="no-results-sub">Essayez de modifier vos filtres</div>'
      + '</div></td></tr>';
    return;
  }

  tbody.innerHTML = page.map(function(r, i) {
    var es         = effectiveStatut(r);
    var showCancel = canCancel(r);
    return '<tr style="animation-delay:' + (i*0.04) + 's">'
      + '<td><span class="td-id">#' + r.id + '</span></td>'
      + '<td><div class="td-client"><div class="cl-av">' + esc(initials(r.client)) + '</div><div>'
      + '<div class="cl-name">' + esc(r.client) + '</div>'
      + '<div class="cl-email">' + esc(r.clientEmail||'') + '</div>'
      + '</div></div></td>'
      + '<td class="td-car">' + nomVoiture(r) + '</td>'
      + '<td class="td-date">' + fmtDate(r.dateDebut) + '</td>'
      + '<td class="td-date">' + fmtDate(r.dateFin) + '</td>'
      + '<td class="td-duree">' + duree(r.dateDebut, r.dateFin) + '</td>'
      + '<td class="td-prix">' + fmtPrix(r.totalPrix) + '</td>'
      + '<td><span class="badge ' + bCls(es) + '">' + bLbl(es) + '</span></td>'
      + '<td>' + (showCancel
          ? '<button class="btn-annuler" data-id="' + r.id + '">'
            + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
            + '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
            + '</svg>Annuler</button>'
          : '<span class="td-action-empty">—</span>')
      + '</td></tr>';
  }).join('');

  tbody.querySelectorAll('.btn-annuler').forEach(function(btn) {
    btn.addEventListener('click', function() {
      openModal(parseInt(btn.dataset.id, 10));
    });
  });
}

/* ════════════════════════════
   PAGINATION
════════════════════════════ */
function renderPagination() {
  const pg = document.getElementById('pagination');
  if (!pg) return;
  const pages = Math.ceil(filteredData.length / PER_PAGE);
  if (pages <= 1) { pg.innerHTML = ''; return; }

  let html = '<button class="pg-btn" id="pgPrev"' + (currentPage===1?' disabled':'') + '>'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>';

  for (let i=1; i<=pages; i++) {
    if (i===1 || i===pages || Math.abs(i-currentPage)<=1)
      html += '<button class="pg-btn' + (i===currentPage?' active':'') + '" data-page="' + i + '">' + i + '</button>';
    else if (Math.abs(i-currentPage)===2)
      html += '<span style="color:var(--muted);font-size:12px;padding:0 2px">…</span>';
  }

  html += '<button class="pg-btn" id="pgNext"' + (currentPage===pages?' disabled':'') + '>'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>';

  pg.innerHTML = html;
  pg.querySelector('#pgPrev')?.addEventListener('click', function() { if (currentPage>1) { currentPage--; renderTable(); renderPagination(); } });
  pg.querySelector('#pgNext')?.addEventListener('click', function() { if (currentPage<pages) { currentPage++; renderTable(); renderPagination(); } });
  pg.querySelectorAll('.pg-btn[data-page]').forEach(function(btn) {
    btn.addEventListener('click', function() { currentPage=parseInt(btn.dataset.page,10); renderTable(); renderPagination(); });
  });
}

/* ════════════════════════════
   RÉSUMÉ
════════════════════════════ */
function renderSummary() {
  const el = document.getElementById('resultsSummary');
  if (!el) return;
  const total = filteredData.length;
  const all   = allData.length;
  el.innerHTML = total===all
    ? '<strong>' + total + '</strong> réservation' + (total>1?'s':'') + ' au total'
    : '<strong>' + total + '</strong> résultat' + (total>1?'s':'') + ' sur ' + all + ' réservations';
}

/* ════════════════════════════
   MODAL ANNULATION
════════════════════════════ */
function openModal(id) {
  cancelTarget = id;
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  cancelTarget = null;
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  const btn = document.getElementById('btnModalConfirm');
  if (btn) {
    btn.classList.remove('loading');
    btn.textContent = "Confirmer l'annulation";
    btn.disabled = false;
  }
}

async function confirmAnnulation() {
  if (cancelTarget === null) return;

  const btn = document.getElementById('btnModalConfirm');
  if (btn) {
    btn.classList.add('loading');
    btn.textContent = 'Annulation…';
    btn.disabled = true;
  }

  try {
    await patchAnnuler(cancelTarget);
    closeModal();
    applyFilters();
    safeShowToast('Réservation annulée avec succès', 'success');
  } catch(e) {
    console.error('[RideWave] confirmAnnulation :', e);
    closeModal();
    safeShowToast(e.message || "Erreur lors de l'annulation", 'error');
  }
}

/* ════════════════════════════
   INIT
════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {

  if (typeof initSidebar === 'function' && !initSidebar('reservations')) return;

  const tDate = document.getElementById('tDate');
  if (tDate) tDate.textContent = new Date().toLocaleDateString('fr-FR',{ weekday:'long', day:'numeric', month:'long' });

  const searchInput = document.getElementById('searchInput');
  const btnClear    = document.getElementById('btnClear');
  searchInput?.addEventListener('input', function() {
    btnClear?.classList.toggle('visible', searchInput.value.length > 0);
    applyFilters();
  });
  btnClear?.addEventListener('click', function() {
    searchInput.value = '';
    btnClear.classList.remove('visible');
    searchInput.focus();
    applyFilters();
  });

  document.getElementById('filterStatut')?.addEventListener('click', function(e) {
    const btn = e.target.closest('.ftab');
    if (!btn) return;
    document.querySelectorAll('#filterStatut .ftab').forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active');
    applyFilters();
  });

  document.getElementById('dateFrom')?.addEventListener('change', applyFilters);
  document.getElementById('dateTo')?.addEventListener('change', applyFilters);

  document.getElementById('btnResetFilters')?.addEventListener('click', function() {
    if (searchInput) { searchInput.value=''; btnClear?.classList.remove('visible'); }
    document.querySelectorAll('#filterStatut .ftab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelector('#filterStatut .ftab[data-val=""]')?.classList.add('active');
    const df = document.getElementById('dateFrom');
    const dt = document.getElementById('dateTo');
    if (df) df.value = '';
    if (dt) dt.value = '';
    applyFilters();
  });

  document.getElementById('btnRefresh')?.addEventListener('click', async function() {
    const svg = document.querySelector('#btnRefresh svg');
    if (svg) svg.style.animation = 'spin .6s linear infinite';
    try {
      const data = await fetchReservations();
      if (data) { allData=[...(data.reservations||[])]; filteredData=[...allData]; applyFilters(); }
    } catch(e) { console.error(e); }
    finally { if (svg) svg.style.animation = ''; }
  });

  document.getElementById('btnModalCancel')?.addEventListener('click', closeModal);
  document.getElementById('btnModalConfirm')?.addEventListener('click', confirmAnnulation);
  document.getElementById('modalOverlay')?.addEventListener('click', function(e) {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

  try {
    const data = await fetchReservations();
    if (data) {
      allData      = [...(data.reservations||[])];
      filteredData = [...allData];
      renderTable();
      renderPagination();
      renderSummary();
    }
  } catch(e) {
    console.error('[RideWave reservations]', e);
  } finally {
    if (typeof hideLoading === 'function') hideLoading();
  }
});

// Administration des réservations : recherche, filtres, pagination et annulation.
