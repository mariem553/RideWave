/* ═══════════════════════════════════════════════════════════════
   voiture.js — Page Flotte (liste + filtres + réservation)
   Responsable : Mariem
   Phase 1 : données statiques JS
   Phase 2 : remplacer FAKE_VOITURES par fetch('/api/voitures')
   ═══════════════════════════════════════════════════════════════ */

/* ─── Données statiques Phase 1 ─────────────────────────────── */
const FAKE_VOITURES = [
  {
    id: 1,
    marque: "Mercedes-Benz",
    modele: "Classe E 220d",
    annee: 2023,
    prix_jour: 320,
    disponible: true,
    categorie: "Berline",
    carburant: "Diesel",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  },
  {
    id: 2,
    marque: "BMW",
    modele: "Série 5 530i",
    annee: 2023,
    prix_jour: 350,
    disponible: true,
    categorie: "Berline",
    carburant: "Essence",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  },
  {
    id: 3,
    marque: "Audi",
    modele: "A6 Quattro",
    annee: 2022,
    prix_jour: 280,
    disponible: false,
    categorie: "Berline",
    carburant: "Essence",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
  },
  {
    id: 4,
    marque: "Porsche",
    modele: "Cayenne S",
    annee: 2023,
    prix_jour: 480,
    disponible: true,
    categorie: "SUV",
    carburant: "Essence",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
  },
  {
    id: 5,
    marque: "Range Rover",
    modele: "Velar P400",
    annee: 2023,
    prix_jour: 420,
    disponible: true,
    categorie: "SUV",
    carburant: "Essence",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  },
  {
    id: 6,
    marque: "Tesla",
    modele: "Model 3 Performance",
    annee: 2024,
    prix_jour: 290,
    disponible: true,
    categorie: "Électrique",
    carburant: "Électrique",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
  },
  {
    id: 7,
    marque: "Mercedes-Benz",
    modele: "GLE 450 AMG",
    annee: 2024,
    prix_jour: 500,
    disponible: false,
    categorie: "SUV",
    carburant: "Hybride",
    transmission: "Auto",
    places: 7,
    photo: "https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800&q=80",
  },
  {
    id: 8,
    marque: "Volkswagen",
    modele: "Passat Business",
    annee: 2022,
    prix_jour: 140,
    disponible: true,
    categorie: "Berline",
    carburant: "Diesel",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&q=80",
  },
  {
    id: 9,
    marque: "Toyota",
    modele: "RAV4 Hybrid",
    annee: 2023,
    prix_jour: 165,
    disponible: true,
    categorie: "SUV",
    carburant: "Hybride",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80",
  },
  {
    id: 10,
    marque: "Audi",
    modele: "Q7 S-Line",
    annee: 2023,
    prix_jour: 390,
    disponible: true,
    categorie: "SUV",
    carburant: "Diesel",
    transmission: "Auto",
    places: 7,
    photo: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80",
  },
  {
    id: 11,
    marque: "BMW",
    modele: "X5 xDrive40i",
    annee: 2022,
    prix_jour: 440,
    disponible: false,
    categorie: "SUV",
    carburant: "Essence",
    transmission: "Auto",
    places: 5,
    photo: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80",
  },
  {
    id: 12,
    marque: "Volkswagen",
    modele: "Golf 8 GTI",
    annee: 2022,
    prix_jour: 110,
    disponible: true,
    categorie: "Compacte",
    carburant: "Essence",
    transmission: "Manual",
    places: 5,
    photo: "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80",
  },
];

/* ─── State ──────────────────────────────────────────────────── */
let voitures = []; // populated after "fetch"
let filteredVoitures = [];

/* ─── DOM refs ───────────────────────────────────────────────── */
const grid        = document.getElementById("cars-grid");
const emptyState  = document.getElementById("cars-empty");
const filterCount = document.getElementById("filter-count");
const selMarque   = document.getElementById("filter-marque");
const selPrix     = document.getElementById("filter-prix");
const chkDispo    = document.getElementById("filter-dispo");
const resetBtns   = [
  document.getElementById("filter-reset"),
  document.getElementById("empty-reset-btn"),
];

/* ─── Nav state ──────────────────────────────────────────────── */
function isLoggedIn() {
  return !!localStorage.getItem("token");
}
function updateNav() {
  const authLink    = document.getElementById("nav-auth-link");
  const reserveLabel= document.getElementById("nav-reserve-label");
  const user        = JSON.parse(localStorage.getItem("user") || "null");
  if (isLoggedIn() && user) {
    if (authLink) { authLink.textContent = user.nom || "Mon compte"; authLink.href = "profile.html"; }
    if (reserveLabel) reserveLabel.textContent = "Réserver";
  }
}

/* ─── Nav scroll ─────────────────────────────────────────────── */
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar?.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

/* ─── Hamburger ──────────────────────────────────────────────── */
document.getElementById("hamburger")?.addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.add("open");
});
document.getElementById("mobileClose")?.addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.remove("open");
});

/* ═══════════════════════════════════════════════════════════════
   DATA LOADING
   ═══════════════════════════════════════════════════════════════ */

/**
 * Simule GET /api/voitures
 * Phase 2 : remplacer par un vrai fetch() :
 *   const res  = await fetch('/api/voitures', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } });
 *   const data = await res.json();
 *   return data;
 */
async function fetchVoitures() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(FAKE_VOITURES), 600); // simule latence réseau
  });
}

/* ═══════════════════════════════════════════════════════════════
   FILTERS
   ═══════════════════════════════════════════════════════════════ */
function populateBrandFilter(data) {
  const marques = [...new Set(data.map((v) => v.marque))].sort();
  marques.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    selMarque.appendChild(opt);
  });
}

function applyFilters() {
  const marque = selMarque.value;
  const prix   = selPrix.value ? parseInt(selPrix.value, 10) : null;
  const dispo  = chkDispo.checked;

  filteredVoitures = voitures.filter((v) => {
    if (marque && v.marque !== marque) return false;
    if (prix   && v.prix_jour > prix)  return false;
    if (dispo  && !v.disponible)        return false;
    return true;
  });

  renderGrid(filteredVoitures);
}

function resetFilters() {
  selMarque.value   = "";
  selPrix.value     = "";
  chkDispo.checked  = false;
  applyFilters();
}

/* ─── Filter event listeners ─────────────────────────────────── */
selMarque.addEventListener("change", applyFilters);
selPrix.addEventListener("change", applyFilters);
chkDispo.addEventListener("change", applyFilters);
resetBtns.forEach((btn) => btn?.addEventListener("click", resetFilters));

/* ═══════════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════════ */
function renderSkeletons(n = 6) {
  grid.innerHTML = "";
  for (let i = 0; i < n; i++) {
    grid.insertAdjacentHTML(
      "beforeend",
      `<div class="car-skeleton">
        <div class="skeleton-photo"></div>
        <div class="skeleton-body">
          <div class="skeleton-line skeleton-line--short"></div>
          <div class="skeleton-line skeleton-line--wide" style="height:18px;margin-bottom:16px;"></div>
          <div class="skeleton-line skeleton-line--mid"></div>
          <div class="skeleton-line skeleton-line--short" style="margin-top:20px;"></div>
        </div>
      </div>`
    );
  }
}

function renderGrid(data) {
  grid.innerHTML = "";

  if (!data.length) {
    emptyState.style.display = "flex";
    filterCount.textContent  = "0 véhicule";
    return;
  }

  emptyState.style.display = "none";
  filterCount.textContent  = `${data.length} véhicule${data.length > 1 ? "s" : ""}`;

  data.forEach((v, idx) => {
    const card = buildCard(v, idx);
    grid.appendChild(card);

    // stagger entry animation
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add("is-visible"), idx * 70);
    });
  });
}

/* ─── Build single card ──────────────────────────────────────── */
function buildCard(v, idx) {
  const el = document.createElement("div");
  el.className = "car-card";
  el.dataset.id = v.id;

  const badgeClass = v.disponible ? "car-badge--dispo" : "car-badge--indispo";
  const badgeLabel = v.disponible ? "Disponible" : "Indisponible";
  const btnClass   = v.disponible ? "" : "car-reserve-btn--indispo";
  const btnLabel   = v.disponible ? "Réserver" : "Non dispo.";

  el.innerHTML = `
    <div class="car-card-photo">
      <img
        src="${v.photo}"
        alt="${v.marque} ${v.modele}"
        class="car-card-img"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80'"
      />
      <div class="car-card-photo-grad"></div>

      <span class="car-badge ${badgeClass}">
        <span class="car-badge-dot"></span>
        ${badgeLabel}
      </span>

      <span class="car-category-tag">${v.categorie}</span>
    </div>

    <div class="car-card-body">
      <div class="car-brand-model">
        <p class="car-brand">${v.marque} · ${v.annee}</p>
        <p class="car-model">${v.modele}</p>
      </div>

      <div class="car-specs">
        <span class="car-spec-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 3h4l2.5 7.5M7 12h10l2-6H5.5"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
          ${v.carburant}
        </span>
        <span class="car-spec-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          ${v.transmission}
        </span>
        <span class="car-spec-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${v.places} places
        </span>
      </div>

      <div class="car-card-sep"></div>

      <div class="car-card-footer">
        <div class="car-price-wrap">
          <span class="car-price-from">À partir de</span>
          <span class="car-price">${v.prix_jour}</span>
          <span class="car-price-unit">TND / jour</span>
        </div>

        <button
          class="car-reserve-btn ${btnClass}"
          data-voiture-id="${v.id}"
          ${!v.disponible ? "disabled" : ""}
          aria-label="Réserver ${v.marque} ${v.modele}"
        >
          <span class="btn-inner">
            ${btnLabel}
            ${v.disponible ? `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            ` : ""}
          </span>
        </button>
      </div>
    </div>
  `;

  /* ─ Bouton Réserver ─ */
  if (v.disponible) {
    el.querySelector(".car-reserve-btn").addEventListener("click", () => {
      handleReservation(v.id);
    });
  }

  return el;
}

/* ═══════════════════════════════════════════════════════════════
   RESERVATION LOGIC
   ═══════════════════════════════════════════════════════════════ */
function handleReservation(voitureId) {
  if (isLoggedIn()) {
    /* Connecté → aller direct à la réservation */
    window.location.href = `reservation.html?voiture_id=${voitureId}`;
  } else {
    /* Non connecté → sauvegarder l'intention + rediriger vers login */
    sessionStorage.setItem("voiture_id", voitureId);
    window.location.href = "login.html";
  }
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL REVEAL (cartes + sections)
   ═══════════════════════════════════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("active");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal-up, .reveal-scale, .stagger-container").forEach((el) =>
    observer.observe(el)
  );
}

/* ═══════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", async () => {
  updateNav();
  initReveal();

  /* Show skeletons while loading */
  renderSkeletons(6);

  try {
    /* ── PHASE 1 — données statiques ── */
    voitures = await fetchVoitures();
    /* ── FIN PHASE 1 ──
       PHASE 2 : remplacer fetchVoitures() par :
         const res = await fetch('/api/voitures');
         if (!res.ok) throw new Error('Erreur API');
         voitures  = await res.json();
    */

    filteredVoitures = voitures;
    populateBrandFilter(voitures);
    renderGrid(voitures);
    initReveal();
  } catch (err) {
    console.error("[RideWave] Impossible de charger les voitures :", err);
    grid.innerHTML = `
      <div class="cars-empty" style="display:flex;grid-column:1/-1;">
        <div class="cars-empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <p class="cars-empty-title font-display">Erreur de chargement</p>
        <p class="cars-empty-sub">Impossible de récupérer les véhicules. Veuillez réessayer.</p>
        <button class="btn-outline" onclick="location.reload()">Réessayer</button>
      </div>
    `;
    emptyState.style.display = "none";
    filterCount.textContent = "— véhicules";
  }
});