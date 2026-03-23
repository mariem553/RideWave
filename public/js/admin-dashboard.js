/* ═══════════════════════════════════════════════════════════
   admin-dashboard.js — RideWave Admin
   Chemin : public/js/admin-dashboard.js
   Champs adaptés au schéma BD :
     date_debut → dateDebut
     date_fin   → dateFin
     statut     → 'confirmee' | 'annulee' (sans accent)
   ═══════════════════════════════════════════════════════════ */
'use strict';

const API_URL    = '/api/admin/stats';
const LOGIN_PATH = '/admin/login';
const USE_MOCK   = true; // ← vraie API

/* ── Données mock (fallback si USE_MOCK = true) ── */
const MOCK = {
  totalVoitures:           51,
  voituresDisponibles:     23,
  reservationsConfirmees:  19,
  reservationsAnnulees:    3,
  dernieresReservations: [
    {
      id:        1,
      client:    'Ahmed Ben Ali',
      voiture:   'Toyota Corolla',
      dateDebut: '2026-03-10',
      dateFin:   '2026-03-13',
      totalPrix: 255.00,
      statut:    'confirmee',
    },
    {
      id:        2,
      client:    'Sana Trabelsi',
      voiture:   'Volkswagen Golf',
      dateDebut: '2026-03-05',
      dateFin:   '2026-03-07',
      totalPrix: 190.00,
      statut:    'annulee',
    },
    {
      id:        3,
      client:    'Karim Mansouri',
      voiture:   'Renault Clio',
      dateDebut: '2026-04-01',
      dateFin:   '2026-04-05',
      totalPrix: 260.00,
      statut:    'confirmee',
    },
    {
      id:        4,
      client:    'Nadia Bouaziz',
      voiture:   'Peugeot 308',
      dateDebut: '2026-04-12',
      dateFin:   '2026-04-16',
      totalPrix: 440.00,
      statut:    'confirmee',
    },
    {
      id:        5,
      client:    'Youssef Hamdi',
      voiture:   'Dacia Sandero',
      dateDebut: '2026-04-20',
      dateFin:   '2026-04-22',
      totalPrix: 110.00,
      statut:    'annulee',
    },
    {
      id:        6,
      client:    'Sana Trabelsi',
      voiture:   'Toyota Corolla',
      dateDebut: '2026-05-01',
      dateFin:   '2026-05-04',
      totalPrix: 255.00,
      statut:    'confirmee',
    },]
};

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
   API
════════════════════════════ */
async function fetchStats(token) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 600));
    return MOCK;
  }
  const res = await fetch(API_URL, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (res.status === 401 || res.status === 403) { logout(); return null; }
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
 
/* ════════════════════════════
   HELPERS
════════════════════════════ */
const fmtDate = s => {
  if (!s) return '—';
  const date = new Date(s);
  const d = String(date.getUTCDate()).padStart(2, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
};
const initials = n => n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase();
const esc      = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const nights   = (d1, d2) => {
  const n = Math.round((new Date(d2) - new Date(d1)) / 86400000);
  return n > 0 ? `${n} nuit${n > 1 ? 's' : ''}` : '';
};
const bCls = s => ({ confirmee: 'b-ok', annulee: 'b-ko' })[s?.toLowerCase()] || 'b-wait';
const bLbl = s => ({ confirmee: 'Confirmée', annulee: 'Annulée' })[s?.toLowerCase()] || s || '—';
const fmtPrix = n => `${Number(n).toFixed(2)} TND`;
 
/* ════════════════════════════
   COUNTER ANIMATION
════════════════════════════ */
function countUp(el, target) {
  const t0 = performance.now();
  const run = now => {
    const p = Math.min((now - t0) / 900, 1);
    el.textContent = Math.round((1 - Math.pow(2, -10 * p)) * target);
    if (p < 1) requestAnimationFrame(run);
    else el.textContent = target;
  };
  requestAnimationFrame(run);
}
 
/* ════════════════════════════
   KPI CONFIG
════════════════════════════ */
const KPI = [
  {
    k: 'totalVoitures', t: 'total',
    lbl: 'Total des voitures', pill: 'Parc complet',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>`,
    sub: s => `${s.totalVoitures - s.voituresDisponibles} en location actuellement`,
  },
  {
    k: 'voituresDisponibles', t: 'dispo',
    lbl: 'Voitures disponibles', pill: '↑ Disponibles',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    sub: s => `${Math.round(s.voituresDisponibles / s.totalVoitures * 100)}% du parc libre`,
  },
  {
    k: 'reservationsConfirmees', t: 'confirmed',
    lbl: 'Réservations confirmées', pill: '↑ Ce mois',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    sub: () => 'Total depuis le début',
  },
  {
    k: 'reservationsAnnulees', t: 'cancelled',
    lbl: 'Réservations annulées', pill: 'Total',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    sub: s => {
      const total = s.reservationsConfirmees + s.reservationsAnnulees;
      if (!total) return 'Aucune réservation';
      return `Taux d'annulation : ${Math.round(s.reservationsAnnulees / total * 100)}%`;
    },
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
      <div class="kpi-val" data-tgt="${stats[c.k] || 0}">0</div>
      <div class="kpi-lbl">${esc(c.lbl)}</div>
      <div class="kpi-sub">${c.sub(stats)}</div>
    </div>`).join('');
  grid.querySelectorAll('.kpi-val[data-tgt]').forEach(el => countUp(el, parseInt(el.dataset.tgt, 10)));
  const cc = document.getElementById('carCount');
  const rc = document.getElementById('resCount');
  if (cc) cc.textContent = stats.totalVoitures;
  if (rc) rc.textContent = stats.reservationsConfirmees;
}
 
/* ════════════════════════════
   RENDER TABLE — max 4 lignes
════════════════════════════ */
const MAX_ROWS = 4;
 
function renderTable(rows) {
  const tbody  = document.getElementById('tbody');
  const count  = document.getElementById('tcCount');
  const footer = document.getElementById('tableFooter');
  if (!tbody) return;
 
  const total   = rows.length;
  const visible = rows.slice(0, MAX_ROWS);
 
  if (count) count.textContent = `${total} entrée${total > 1 ? 's' : ''}`;
 
  if (!total) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:36px;color:var(--muted);font-size:13px">Aucune réservation récente</td></tr>`;
    if (footer) footer.style.display = 'none';
    return;
  }
 
  tbody.innerHTML = visible.map(r => `
    <tr>
      <td>
        <div class="td-client">
          <div class="cl-av">${esc(initials(r.client))}</div>
          <span class="cl-name">${esc(r.client)}</span>
        </div>
      </td>
      <td class="td-car">${esc(r.voiture)}</td>
      <td class="td-dates">
        ${fmtDate(r.dateDebut)}<span class="td-sep">→</span>${fmtDate(r.dateFin)}
        <br><span style="font-size:11px;color:var(--muted)">${nights(r.dateDebut, r.dateFin)}</span>
      </td>
      <td><span class="badge ${bCls(r.statut)}">${esc(bLbl(r.statut))}</span></td>
      <td class="td-act">
        <button class="btn-see" data-id="${r.id}">Voir</button>
      </td>
    </tr>`).join('');
 
  /* Bind boutons Voir */
  tbody.querySelectorAll('.btn-see[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const reservation = rows.find(r => r.id === id);
      if (reservation) openDetailModal(reservation);
    });
  });
 
  /* Footer */
  if (footer) {
    if (total > MAX_ROWS) {
      const restant = total - MAX_ROWS;
      footer.style.display = 'flex';
      footer.innerHTML = `
        <span style="font-size:12px;color:var(--muted)">${restant} réservation${restant > 1 ? 's' : ''} de plus</span>
        <a href="reservations.html" class="btn-voir-plus">
          Voir toutes les réservations
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>`;
    } else {
      footer.style.display = 'none';
    }
  }
}
 
/* ════════════════════════════
   MODAL DÉTAIL RÉSERVATION
════════════════════════════ */
function openDetailModal(r) {
  const overlay = document.getElementById('detailOverlay');
  if (!overlay) return;
 
  const nuits    = nights(r.dateDebut, r.dateFin) || '—';
  const badgeCls = bCls(r.statut);
  const badgeLbl = bLbl(r.statut);
 
  /* Image avec fallback SVG si image absente */
  const imgContent = r.voitureImage
    ? `<img src="${esc(r.voitureImage)}" alt="${esc(r.voiture)}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
            style="width:100%;height:100%;object-fit:cover;border-radius:12px 12px 0 0"
       />
       <div class="modal-img-fallback" style="display:none">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
           <rect x="9" y="11" width="14" height="10" rx="2"/>
           <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
         </svg>
         <span>${esc(r.voiture)}</span>
       </div>`
    : `<div class="modal-img-fallback">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
           <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
           <rect x="9" y="11" width="14" height="10" rx="2"/>
           <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
         </svg>
         <span>${esc(r.voiture)}</span>
       </div>`;
 
  overlay.querySelector('.detail-modal').innerHTML = `
 
    <!-- Croix fermeture -->
    <button class="detail-close" id="detailClose">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
 
    <!-- Image voiture -->
    <div class="detail-img">${imgContent}</div>
 
    <!-- Contenu -->
    <div class="detail-body">
 
      <!-- En-tête voiture -->
      <div class="detail-car-header">
        <div>
          <div class="detail-car-name">${esc(r.marque || '')} <em>${esc(r.modele || r.voiture)}</em></div>
          <div class="detail-car-meta">
            ${r.annee ? `<span>${r.annee}</span>` : ''}
            ${r.prixJour ? `<span>${r.prixJour} TND / jour</span>` : ''}
          </div>
        </div>
        <span class="badge ${badgeCls}" style="flex-shrink:0">${badgeLbl}</span>
      </div>
 
      <div class="detail-divider"></div>
 
      <!-- Infos reservation -->
      <div class="detail-section-label">Réservation #${r.id}</div>
      <div class="detail-grid">
 
        <div class="detail-item">
          <div class="detail-item-label">Client</div>
          <div class="detail-item-val">
            <div class="cl-av" style="width:28px;height:28px;font-size:10px">${esc(initials(r.client))}</div>
            <div>
              <div style="font-weight:500">${esc(r.client)}</div>
              ${r.clientEmail ? `<div style="font-size:11px;color:var(--muted)">${esc(r.clientEmail)}</div>` : ''}
            </div>
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
          <div class="detail-item-val">${nuits}</div>
        </div>
 
      </div>
 
      <div class="detail-divider"></div>
 
      <!-- Total -->
      <div class="detail-total">
        <span class="detail-total-label">Total</span>
        <span class="detail-total-val">${fmtPrix(r.totalPrix)}</span>
      </div>
 
    </div>`;
 
  /* Bind fermeture */
  overlay.querySelector('#detailClose')?.addEventListener('click', closeDetailModal);
 
  /* Ouvrir */
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
 
function closeDetailModal() {
  const overlay = document.getElementById('detailOverlay');
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
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
   REFRESH
════════════════════════════ */
async function refresh() {
  const token = getToken(); if (!token) return;
  const svg = document.querySelector('#btnRefresh svg');
  if (svg) svg.style.animation = 'spin .6s linear infinite';
  try {
    const s = await fetchStats(token);
    if (s) { renderKPI(s); renderTable(s.dernieresReservations || []); }
  } catch(e) { console.error('[RideWave]', e); }
  finally { if (svg) svg.style.animation = ''; }
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
 
  document.getElementById('btnRefresh')?.addEventListener('click', refresh);
  document.getElementById('btnLogout')?.addEventListener('click', logout);
  document.getElementById('mobileToggle')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('toggleSidebar'));
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sbOverlay')?.classList.toggle('on');
  });
 
  /* Fermer modal en cliquant overlay */
  document.getElementById('detailOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('detailOverlay')) closeDetailModal();
  });
 
  /* Fermer avec Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDetailModal();
  });
 
  try {
    const stats = await fetchStats(token);
    if (stats) { renderKPI(stats); renderTable(stats.dernieresReservations || []); }
  } catch(e) {
    console.error('[RideWave dashboard]', e);
  } finally {
    hideLoading();
  }
});