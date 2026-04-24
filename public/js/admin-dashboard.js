/* ═══════════════════════════════════════════════════════════
   admin-dashboard.js — RideWave Admin Dashboard
   ═══════════════════════════════════════════════════════════ */
'use strict';

const API_URL  = '/api/admin/stats';
const USE_MOCK = false;

/* ── Données mock ── */
const MOCK = {
  totalVoitures:           12,
  voituresDisponibles:     8,
  reservationsConfirmees:  19,
  reservationsAnnulees:    3,
  dernieresReservations: [
    { id:1, client:'Ahmed Ben Ali',  marque:'Toyota',     modele:'Corolla', dateDebut:'2026-01-10', dateFin:'2026-01-13', totalPrix:255.00, statut:'confirmee' },
    { id:2, client:'Sana Trabelsi',  marque:'Volkswagen', modele:'Golf',    dateDebut:'2026-01-05', dateFin:'2026-01-07', totalPrix:190.00, statut:'annulee'   },
    { id:3, client:'Karim Mansouri', marque:'Renault',    modele:'Clio',    dateDebut:'2026-04-01', dateFin:'2026-04-05', totalPrix:260.00, statut:'confirmee' },
    { id:4, client:'Nadia Bouaziz',  marque:'Peugeot',    modele:'308',     dateDebut:'2026-04-28', dateFin:'2026-05-01', totalPrix:440.00, statut:'confirmee' },
    { id:5, client:'Youssef Hamdi',  marque:'Dacia',      modele:'Sandero', dateDebut:'2026-03-20', dateFin:'2026-03-22', totalPrix:110.00, statut:'annulee'   },
    { id:6, client:'Sana Trabelsi',  marque:'Toyota',     modele:'Corolla', dateDebut:'2026-05-10', dateFin:'2026-05-13', totalPrix:255.00, statut:'confirmee' },
  ],
};

/* ── Statut effectif (identique à admin-reservations.js) ── */
const TODAY_ISO = new Date().toISOString().slice(0, 10);

function effectiveStatut(r) {
  if (r.statut === 'annulee') return 'annulee';
  if (r.dateFin && r.dateFin < TODAY_ISO) return 'terminee';
  return r.statut;
}

/* ════════════════════════════
   API
════════════════════════════ */
async function fetchStats() {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return MOCK;
  }
  const token = getAdminToken();
  const res   = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.status === 401 || res.status === 403) { adminLogout(); return null; }
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

/* ════════════════════════════
   HELPERS
════════════════════════════ */
const esc      = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtDate  = s => {
  if (!s) return '—';
  const d = new Date(s);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
};
const initials   = n => n.split(' ').map(x => x[0]).join('').substring(0,2).toUpperCase();
const nights     = (d1,d2) => { const n = Math.round((new Date(d2)-new Date(d1))/86400000); return n>0?`${n} nuit${n>1?'s':''}`:'' };
const fmtPrix    = n => `${Number(n).toFixed(2)} TND`;
const nomVoiture = r => esc((r.marque || '') + ' ' + (r.modele || ''));

function bCls(statut) {
  switch (statut) {
    case 'confirmee': return 'b-ok';
    case 'annulee':   return 'b-ko';
    case 'terminee':  return 'b-done';
    default:          return 'b-wait';
  }
}
function bLbl(statut) {
  switch (statut) {
    case 'confirmee': return 'Confirmée';
    case 'annulee':   return 'Annulée';
    case 'terminee':  return 'Terminée';
    default:          return statut || '—';
  }
}

/* ════════════════════════════
   COUNTER ANIMATION
════════════════════════════ */
function countUp(el, target) {
  const t0 = performance.now();
  const run = now => {
    const p = Math.min((now - t0) / 900, 1);
    el.textContent = Math.round((1 - Math.pow(2, -10 * p)) * target);
    if (p < 1) requestAnimationFrame(run); else el.textContent = target;
  };
  requestAnimationFrame(run);
}

/* ════════════════════════════
   KPI CONFIG
════════════════════════════ */
const KPI = [
  {
    k:'totalVoitures', t:'total', lbl:'Total des voitures', pill:'Parc complet',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>`,
    sub: s => `${s.totalVoitures - s.voituresDisponibles} en location`,
  },
  {
    k:'voituresDisponibles', t:'dispo', lbl:'Voitures disponibles', pill:'↑ Disponibles',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    sub: s => (s.totalVoitures ? `${Math.round((s.voituresDisponibles / s.totalVoitures) * 100)}% du parc libre` : '—'),
  },
  {
    k:'reservationsConfirmees', t:'confirmed', lbl:'Réservations confirmées', pill:'↑ Ce mois',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    sub: () => 'Total depuis le début',
  },
  {
    k:'reservationsAnnulees', t:'cancelled', lbl:'Réservations annulées', pill:'Total',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    sub: s => { const t=s.reservationsConfirmees+s.reservationsAnnulees; return t?`Taux d'annulation : ${Math.round(s.reservationsAnnulees/t*100)}%`:'Aucune réservation'; },
  },
];

/* ════════════════════════════
   RENDER KPI
════════════════════════════ */
function renderKPI(stats) {
  const grid = document.getElementById('kpiGrid');
  if (!grid) return;
  grid.innerHTML = KPI.map(c => `
    <div class="kpi-card" data-t="${c.t}">
      <div class="kpi-blob"></div>
      <div class="kpi-top">
        <div class="kpi-icon">${c.icon}</div>
        <span class="kpi-pill">${esc(c.pill)}</span>
      </div>
      <div class="kpi-val" data-tgt="${stats[c.k]||0}">0</div>
      <div class="kpi-lbl">${esc(c.lbl)}</div>
      <div class="kpi-sub">${c.sub(stats)}</div>
    </div>`).join('');
  grid.querySelectorAll('.kpi-val[data-tgt]').forEach(el => countUp(el, parseInt(el.dataset.tgt, 10)));
}

/* ════════════════════════════
   RENDER TABLE (max 4 lignes)
════════════════════════════ */
const MAX_ROWS = 4;

function renderTable(rows) {
  const tbody  = document.getElementById('tbody');
  const count  = document.getElementById('tcCount');
  const footer = document.getElementById('tableFooter');
  if (!tbody) return;

  const total   = rows.length;
  const visible = rows.slice(0, MAX_ROWS);

  if (count) count.textContent = `${total} entrée${total>1?'s':''}`;

  if (!total) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:36px;color:var(--muted);font-size:13px">Aucune réservation récente</td></tr>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  tbody.innerHTML = visible.map(r => {
    const es = effectiveStatut(r);
    return `
    <tr>
      <td>
        <div class="td-client">
          <div class="cl-av">${esc(initials(r.client))}</div>
          <span class="cl-name">${esc(r.client)}</span>
        </div>
      </td>
      <td class="td-car">${nomVoiture(r)}</td>
      <td class="td-dates">
        ${fmtDate(r.dateDebut)}<span class="td-sep">→</span>${fmtDate(r.dateFin)}
        <br><span style="font-size:11px;color:var(--muted)">${nights(r.dateDebut,r.dateFin)}</span>
      </td>
      <td><span class="badge ${bCls(es)}">${esc(bLbl(es))}</span></td>
      <td class="td-act">
        <button class="btn-see" data-id="${r.id}">Voir</button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-see[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const r = rows.find(x => x.id === parseInt(btn.dataset.id, 10));
      if (r) openDetailModal(r);
    });
  });

  if (footer) {
    const restant = total - MAX_ROWS;
    if (restant > 0) {
      footer.style.display = 'flex';
      footer.innerHTML = `
        <span style="font-size:12px;color:var(--muted)">${restant} de plus</span>
        <a href="/views/admin/reservations.html" class="btn-voir-plus">
          Voir toutes les réservations
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>`;
    } else {
      footer.style.display = 'none';
    }
  }
}

/* ════════════════════════════
   MODAL DÉTAIL
════════════════════════════ */
function openDetailModal(r) {
  const overlay = document.getElementById('detailOverlay');
  if (!overlay) return;

  const es = effectiveStatut(r);

  const imgContent = r.voitureImage
    ? `<img src="${esc(r.voitureImage)}" alt="${nomVoiture(r)}" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover"/>`
    : `<div class="modal-img-fallback">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
          <rect x="9" y="11" width="14" height="10" rx="2"/>
          <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        </svg>
        <span>${nomVoiture(r)}</span>
      </div>`;

  overlay.querySelector('.detail-modal').innerHTML = `
    <button class="detail-close" id="detailClose">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <div class="detail-img">${imgContent}</div>
    <div class="detail-body">
      <div class="detail-car-header">
        <div>
          <div class="detail-car-name">
            ${esc(r.marque || '')} <em>${esc(r.modele || '')}</em>
          </div>
        </div>
        <span class="badge ${bCls(es)}">${bLbl(es)}</span>
      </div>
      <div class="detail-divider"></div>
      <div class="detail-section-label">Réservation #${r.id}</div>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-item-label">Client</div>
          <div class="detail-item-val">
            <div class="cl-av" style="width:28px;height:28px;font-size:10px">${esc(initials(r.client))}</div>
            <span>${esc(r.client)}</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Date début</div>
          <div class="detail-item-val">${fmtDate(r.dateDebut)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Date fin</div>
          <div class="detail-item-val">${fmtDate(r.dateFin)}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">Durée</div>
          <div class="detail-item-val">${nights(r.dateDebut,r.dateFin)||'—'}</div>
        </div>
      </div>
      <div class="detail-divider"></div>
      <div class="detail-total">
        <span class="detail-total-label">Total</span>
        <span class="detail-total-val">${fmtPrix(r.totalPrix)}</span>
      </div>
    </div>`;

  overlay.querySelector('#detailClose')?.addEventListener('click', closeDetailModal);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal() {
  const overlay = document.getElementById('detailOverlay');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ════════════════════════════
   REFRESH
════════════════════════════ */
async function doRefresh() {
  const svg = document.querySelector('#btnRefresh svg');
  if (svg) svg.style.animation = 'spin .6s linear infinite';
  try {
    const s = await fetchStats();
    if (s) { renderKPI(s); renderTable(s.dernieresReservations||[]); }
  } catch(e) { console.error('[RideWave dashboard]', e); }
  finally   { if (svg) svg.style.animation = ''; }
}

/* ════════════════════════════
   INIT
════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {

  if (!initSidebar('dashboard')) return;

  const tDate = document.getElementById('tDate');
  if (tDate) tDate.textContent = new Date().toLocaleDateString('fr-FR',{ weekday:'long', day:'numeric', month:'long' });

  document.getElementById('btnRefresh')?.addEventListener('click', doRefresh);

  document.getElementById('detailOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('detailOverlay')) closeDetailModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetailModal(); });

  try {
    const stats = await fetchStats();
    if (stats) { renderKPI(stats); renderTable(stats.dernieresReservations||[]); }
  } catch(e) {
    console.error('[RideWave dashboard]', e);
  } finally {
    hideLoading();
  }
});