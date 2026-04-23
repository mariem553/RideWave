/* ═══════════════════════════════════════════════════════════════
   voiture.js — Page Flotte (liste + filtres + réservation)
   Responsable : Mariem
   Phase 1 : données statiques JS
   Phase 2 : remplacer par fetch('/api/voitures')
   ═══════════════════════════════════════════════════════════════ */

/* ── CONFIG ── */
const PER_PAGE = 6;

/** Si l’URL d’image échoue (404), une image différente par id — évite la même photo partout */
const CARD_IMG_FALLBACKS = [
  "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
  "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80",
  "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
];

/* ── STATE ── */
let state = {
  search: '',
  marque: '',
  type: '',
  carburant: '',
  prix: '',
  dispo: false,
  sort: 'default',
  page: 1
};

/** Flotte chargée depuis MySQL via GET /api/voitures */
let VOITURES = [];

/* ── DOM REFS ── */
const grid        = document.getElementById('cars-grid');
const pagination  = document.getElementById('pagination');
const countEl     = document.getElementById('results-count');
const activeFilEl = document.getElementById('active-filters');
const clearAllBtn = document.getElementById('clear-all');
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');
const sortSel     = document.getElementById('sort-select');
const fMarque     = document.getElementById('f-marque');
const fType       = document.getElementById('f-type');
const fCarb       = document.getElementById('f-carburant');
const fPrix       = document.getElementById('f-prix');
const dispoToggle = document.getElementById('dispo-toggle');
const navbar      = document.getElementById('navbar');

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════ */

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function updateNav() {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  const el    = document.getElementById('nav-auth-link');
  if (token && user && el) {
    el.textContent = user.nom || 'Mon compte';
    el.href = '/views/profile.html';
  }
}

function scrollToGrid() {
  window.scrollTo({
    top: document.querySelector('.cars-section').offsetTop - 80,
    behavior: 'smooth'
  });
}

/* ═══════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════ */

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', scrollY > 40);
}, {passive:true});

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('open');
});

document.getElementById('mobileClose').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.remove('open');
});

/* ═══════════════════════════════════════════════════════════════
   API — flotte (MySQL)
   ═══════════════════════════════════════════════════════════════ */

async function loadVoitures() {
  try {
    const res = await fetch("/api/voitures");
    if (!res.ok) throw new Error("API voitures");
    VOITURES = await res.json();
  } catch (e) {
    console.error("[RideWave] loadVoitures", e);
    VOITURES = [];
  }
}

/* ═══════════════════════════════════════════════════════════════
   POPULATE BRANDS
   ═══════════════════════════════════════════════════════════════ */

function populateBrands() {
  [...new Set(VOITURES.map(v => v.marque))].sort().forEach(m => {
    const o = document.createElement('option');
    o.value = m;
    o.textContent = m;
    fMarque.appendChild(o);
  });
}

/* ═══════════════════════════════════════════════════════════════
   FILTER + SORT
   ═══════════════════════════════════════════════════════════════ */

function getFiltered() {
  const q = state.search.toLowerCase().trim();
  let data = VOITURES.filter(v => {
    if (q && !(`${v.marque} ${v.modele}`).toLowerCase().includes(q)) return false;
    if (state.marque    && v.marque    !== state.marque)    return false;
    if (state.type      && v.categorie !== state.type)      return false;
    if (state.carburant && v.carburant !== state.carburant) return false;
    if (state.prix      && v.prix_jour > parseInt(state.prix)) return false;
    if (state.dispo     && !v.disponible)                   return false;
    return true;
  });

  // sort
  if (state.sort === 'prix_asc')   data.sort((a,b) => a.prix_jour - b.prix_jour);
  if (state.sort === 'prix_desc')  data.sort((a,b) => b.prix_jour - a.prix_jour);
  if (state.sort === 'popularite') data.sort((a,b) => b.popularite - a.popularite);
  if (state.sort === 'annee_desc') data.sort((a,b) => b.annee - a.annee);

  return data;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════════ */

function render() {
  const data     = getFiltered();
  const total    = data.length;
  const pages    = Math.ceil(total / PER_PAGE);
  state.page     = Math.min(state.page, Math.max(pages, 1));
  const start    = (state.page - 1) * PER_PAGE;
  const pageData = data.slice(start, start + PER_PAGE);

  // count
  countEl.innerHTML = `<strong>${total}</strong> véhicule${total !== 1 ? 's' : ''}`;

  // active filter tags
  renderTags();

  // grid
  grid.innerHTML = '';
  if (!pageData.length) {
    grid.innerHTML = `
      <div class="cars-empty" style="grid-column:1/-1">
        <div class="empty-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <p class="empty-title">Aucun résultat</p>
        <p class="empty-sub">Aucun véhicule ne correspond à vos critères de recherche.</p>
        <button class="empty-cta" id="empty-reset">Réinitialiser les filtres</button>
      </div>`;
    document.getElementById('empty-reset')?.addEventListener('click', resetAll);
    pagination.innerHTML = '';
    return;
  }

  pageData.forEach((v, i) => {
    const card = buildCard(v);
    grid.appendChild(card);
    requestAnimationFrame(() => setTimeout(() => card.classList.add('vis'), i * 55));
  });

  renderPagination(pages, total);
}

/* ─── TAGS ─── */

const TAG_MAP = {
  search:    { label: q => `"${q}"`,          reset: () => { state.search = ''; searchInput.value = ''; searchClear.classList.remove('show'); } },
  marque:    { label: v => v,                 reset: () => { state.marque = ''; fMarque.value = ''; fMarque.classList.remove('active-filter'); } },
  type:      { label: v => v,                 reset: () => { state.type = '';   fType.value = '';   fType.classList.remove('active-filter'); } },
  carburant: { label: v => v,                 reset: () => { state.carburant = ''; fCarb.value = ''; fCarb.classList.remove('active-filter'); } },
  prix:      { label: v => `≤ ${v} TND/jour`, reset: () => { state.prix = '';   fPrix.value = '';   fPrix.classList.remove('active-filter'); } },
  dispo:     { label: () => 'Disponibles',    reset: () => { state.dispo = false; dispoToggle.classList.remove('on'); dispoToggle.setAttribute('aria-checked','false'); } },
};

function renderTags() {
  activeFilEl.innerHTML = '';
  let hasAny = false;
  const checks = [
    ['search', state.search],
    ['marque', state.marque],
    ['type', state.type],
    ['carburant', state.carburant],
    ['prix', state.prix],
    ['dispo', state.dispo],
  ];
  checks.forEach(([key, val]) => {
    if (!val) return;
    hasAny = true;
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = `${TAG_MAP[key].label(val)}<span class="filter-tag-close" data-key="${key}">✕</span>`;
    activeFilEl.appendChild(tag);
  });
  clearAllBtn.style.display = hasAny ? 'block' : 'none';

  activeFilEl.querySelectorAll('.filter-tag-close').forEach(btn => {
    btn.addEventListener('click', () => {
      TAG_MAP[btn.dataset.key].reset();
      state.page = 1;
      render();
    });
  });
}

/* ─── PAGINATION ─── */

function renderPagination(pages, total) {
  pagination.innerHTML = '';
  if (pages <= 1) return;

  const cur = state.page;

  // prev
  const prev = mkPgBtn('←', cur === 1);
  prev.addEventListener('click', () => { state.page--; render(); scrollToGrid(); });
  pagination.appendChild(prev);

  // page numbers
  const range = getPageRange(cur, pages);
  let lastWas = null;
  range.forEach(p => {
    if (p === '…') {
      const dots = document.createElement('span');
      dots.className = 'pg-dots'; dots.textContent = '…';
      pagination.appendChild(dots);
    } else {
      const btn = mkPgBtn(p, false);
      if (p === cur) btn.classList.add('active');
      btn.addEventListener('click', () => { state.page = p; render(); scrollToGrid(); });
      pagination.appendChild(btn);
    }
    lastWas = p;
  });

  // next
  const next = mkPgBtn('→', cur === pages);
  next.addEventListener('click', () => { state.page++; render(); scrollToGrid(); });
  pagination.appendChild(next);

  // info
  const info = document.createElement('span');
  const start = (cur-1)*PER_PAGE+1, end = Math.min(cur*PER_PAGE, total);
  info.className = 'pg-info';
  info.textContent = `${start}–${end} sur ${total}`;
  pagination.appendChild(info);
}

function mkPgBtn(label, disabled) {
  const btn = document.createElement('button');
  btn.className = 'pg-btn';
  btn.textContent = label;
  if (disabled) btn.disabled = true;
  return btn;
}

function getPageRange(cur, total) {
  if (total <= 7) return Array.from({length:total},(_,i)=>i+1);
  const r = [1];
  if (cur > 3) r.push('…');
  for (let i = Math.max(2,cur-1); i <= Math.min(total-1, cur+1); i++) r.push(i);
  if (cur < total - 2) r.push('…');
  r.push(total);
  return r;
}

/* ═══════════════════════════════════════════════════════════════
   BUILD CARD
   ═══════════════════════════════════════════════════════════════ */

function buildCard(v) {
  const el = document.createElement('div');
  el.className = 'car-card'; el.dataset.id = v.id;
  const d = v.disponible;
  const imgFallback = CARD_IMG_FALLBACKS[(Math.max(1, v.id) - 1) % CARD_IMG_FALLBACKS.length];
  el.innerHTML = `
    <div class="card-photo">
      <img class="card-img" src="${v.photo}" alt="${v.marque} ${v.modele}" loading="lazy"
           onerror="this.onerror=null;this.src='${imgFallback}'">
      <div class="card-fade"></div>
      <span class="card-badge ${d?'badge-ok':'badge-no'}"><span class="badge-dot"></span>${d?'Disponible':'Indisponible'}</span>
      <span class="card-cat">${v.categorie}</span>
    </div>
    <div class="card-body">
      <p class="card-brand">${v.marque} &middot; ${v.annee}</p>
      <p class="card-model">${v.modele}</p>
      <div class="card-specs">
        <span class="spec-pill">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h4l2.5 7.5M7 12h10l2-6H5.5"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
          ${v.carburant}
        </span>
        <span class="spec-pill">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          ${v.transmission}
        </span>
        <span class="spec-pill">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          ${v.places} places
        </span>
      </div>
      <div class="card-sep"></div>
      <div class="card-footer">
        <div class="price-block">
          <span class="price-from">À partir de</span>
          <span class="price-num">${v.prix_jour}</span>
          <span class="price-unit">TND / jour</span>
        </div>
        <button class="reserve-btn${d?'':' dis'}" ${d?'':'disabled'}>
          <span class="ri">
            ${d ? 'Réserver' : 'Non dispo.'}
            ${d ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>' : ''}
          </span>
        </button>
      </div>
    </div>`;
  if (d) el.querySelector('.reserve-btn').addEventListener('click', () => handleReservation(v.id));
  return el;
}

/* ═══════════════════════════════════════════════════════════════
   RESERVATION
   ═══════════════════════════════════════════════════════════════ */

function handleReservation(id) {
  if (isLoggedIn()) {
    window.location.href = `/views/reservation.html?voiture_id=${id}`;
  } else {
    sessionStorage.setItem('voiture_id', id);
    window.location.href = '/views/login.html';
  }
}

/* ═══════════════════════════════════════════════════════════════
   RESET
   ═══════════════════════════════════════════════════════════════ */

function resetAll() {
  state = { search:'', marque:'', type:'', carburant:'', prix:'', dispo:false, sort:'default', page:1 };
  searchInput.value = '';
  searchClear.classList.remove('show');
  sortSel.value  = 'default';
  fMarque.value  = '';
  fType.value    = '';
  fCarb.value    = '';
  fPrix.value    = '';
  [fMarque, fType, fCarb, fPrix].forEach(s => s.classList.remove('active-filter'));
  dispoToggle.classList.remove('on');
  dispoToggle.setAttribute('aria-checked', 'false');
  render();
}

/* ═══════════════════════════════════════════════════════════════
   SKELETONS
   ═══════════════════════════════════════════════════════════════ */

function renderSkeletons() {
  grid.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    grid.insertAdjacentHTML('beforeend',
      `<div class="car-skeleton">
        <div class="sk-photo"></div>
        <div class="sk-body">
          <div class="sk-line sk-w35" style="height:9px;margin-bottom:12px"></div>
          <div class="sk-line sk-w70" style="height:18px;margin-bottom:18px"></div>
          <div class="sk-line sk-w50"></div>
          <div class="sk-line sk-w35" style="margin-top:18px"></div>
        </div>
      </div>`);
  }
}

/* ═══════════════════════════════════════════════════════════════
   EVENT LISTENERS
   ═══════════════════════════════════════════════════════════════ */

let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value;
    searchClear.classList.toggle('show', !!searchInput.value);
    state.page = 1;
    render();
  }, 220);
});

searchClear.addEventListener('click', () => {
  state.search = ''; searchInput.value = ''; searchClear.classList.remove('show');
  state.page = 1; render();
});

sortSel.addEventListener('change', () => { state.sort = sortSel.value; state.page = 1; render(); });

function bindSelect(el, key) {
  el.addEventListener('change', () => {
    state[key] = el.value;
    el.classList.toggle('active-filter', !!el.value);
    state.page = 1;
    render();
  });
}

bindSelect(fMarque, 'marque');
bindSelect(fType,   'type');
bindSelect(fCarb,   'carburant');
bindSelect(fPrix,   'prix');

dispoToggle.addEventListener('click', () => {
  state.dispo = !state.dispo;
  dispoToggle.classList.toggle('on', state.dispo);
  dispoToggle.setAttribute('aria-checked', String(state.dispo));
  state.page = 1;
  render();
});

dispoToggle.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); dispoToggle.click(); }
});

clearAllBtn.addEventListener('click', resetAll);

/* ═══════════════════════════════════════════════════════════════
   REVEAL
   ═══════════════════════════════════════════════════════════════ */

function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('active'); obs.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal-up').forEach(el => obs.observe(el));
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  updateNav();
  initReveal();
  renderSkeletons();
  await loadVoitures();
  populateBrands();

  // 🔍 Récupérer les paramètres de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlType = urlParams.get('type');
  const urlStartDate = urlParams.get('startDate');
  const urlEndDate = urlParams.get('endDate');
  const urlLocation = urlParams.get('location');
  
  console.log('[RideWave] URL Params:', {urlType, urlStartDate, urlEndDate, urlLocation});
  
  // 🔄 Initialiser l'état avec les paramètres URL
  if (urlType) {
    // Mapper la valeur de l'URL (en minuscules) vers la valeur en majuscules
    const typeMap = {
      'sport': 'Sport',
      'suv': 'SUV',
      'berline': 'Berline',
      'cabriolet': 'Cabriolet',
      'electrique': 'Électrique',
      'collection': 'Collection'
    };
    const mappedType = typeMap[urlType.toLowerCase()] || urlType;
    state.type = mappedType;
    fType.value = mappedType;
    fType.classList.add('active-filter');
    console.log('[RideWave] Filtre type appliqué:', mappedType);
  }
  
  // Si des dates sont présentes, activer le filtre disponibilité
  if (urlStartDate || urlEndDate) {
    state.dispo = true;
    dispoToggle.classList.add('on');
    dispoToggle.setAttribute('aria-checked', 'true');
    console.log('[RideWave] Filtre disponibilité activé');
  }

  render();
});
