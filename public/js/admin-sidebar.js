/* ═══════════════════════════════════════════════════════════
   admin-sidebar.js — Sidebar admin partagée
   Description :
   - vérifie l'authentification admin avant accès aux pages
   - fournit des helpers pour le token et l'utilisateur admin
   - construit le menu latéral avec les liens actifs
   - gère l'ouverture mobile et la déconnexion
   ═══════════════════════════════════════════════════════════ */
'use strict';

const LOGIN_PATH = '/views/login.html';

/* ────────────────────────────
   AUTH HELPERS
──────────────────────────── */
function getAdminToken() { return localStorage.getItem('adminToken'); }
function getAdminUser()  {
  try { return JSON.parse(localStorage.getItem('adminUser') || '{}'); }
  catch(e) { return {}; }
}
function checkAdminAuth() {
  if (!getAdminToken()) { window.location.href = LOGIN_PATH; return false; }
  return true;
}
function adminLogout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = LOGIN_PATH;
}

/* ────────────────────────────
   SIDEBAR HTML TEMPLATE
──────────────────────────── */
function buildSidebar(activePage) {
  const user    = getAdminUser();
  const nom     = user.nom || 'Administrateur';
  const initials = nom.split(' ').map(x => x[0]).join('').substring(0,2).toUpperCase();

  const navLinks = [
    {
      id: 'dashboard',
      href: '/views/admin/dashboard.html',
      label: 'Dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>`,
    },
    {
      id: 'voitures',
      href: '/views/admin/voitures.html',
      label: 'Voitures',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      </svg>`,
    },
    {
      id: 'reservations',
      href: '/views/admin/reservations.html',
      label: 'Réservations',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>`,
    },
  ];

  const linksHTML = navLinks.map(l => `
    <a href="${l.href}" class="sb-link${activePage === l.id ? ' active' : ''}">
      ${l.icon}
      ${l.label}
    </a>
  `).join('');

  return `
    <div class="sb-header">
      <div class="sb-logo">
        <div class="sb-logo-icon">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#070709" stroke-width="2.5">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
            <rect x="9" y="11" width="14" height="10" rx="2"/>
            <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          </svg>
        </div>
        <span class="sb-logo-text">RIDE<em>Wave</em></span>
      </div>
      <div class="sb-profile">
        <div class="sb-avatar">${initials}</div>
        <div>
          <div class="sb-name">${nom}</div>
          <div class="sb-role">Administrateur</div>
        </div>
      </div>
    </div>

    <nav class="sb-nav">
      <span class="sb-section">Navigation</span>
      ${linksHTML}
    </nav>

    <div class="sb-footer">
      <button class="btn-logout" onclick="adminLogout()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Déconnexion
      </button>
    </div>
  `;
}

/* ────────────────────────────
   INJECT SIDEBAR
──────────────────────────── */
function initSidebar(activePage) {
  if (!checkAdminAuth()) return false;

  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.innerHTML = buildSidebar(activePage);

  /* Mobile toggle */
  const toggle  = document.getElementById('mobileToggle');
  const overlay = document.getElementById('sbOverlay');
  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('on');
  });
  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('on');
  });

  return true;
}

/* ────────────────────────────
   TOAST HELPER (partagé)
──────────────────────────── */
function showToast(msg, type = 'success') {
  const esc  = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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

/* ────────────────────────────
   LOADING SCREEN HELPER
──────────────────────────── */
function hideLoading() {
  const el = document.getElementById('loading-screen');
  if (!el) return;
  el.classList.add('hidden');
  setTimeout(() => el.remove(), 520);
}

// Sidebar et helpers communs pour l'interface d'administration.
