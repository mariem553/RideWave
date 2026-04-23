/* ===============================================================
   profile.js - Page Profil & Mes Reservations
   Responsable : Oumayma
   Phase 1 : donnees statiques
   Phase 2 : remplacer par les vrais fetch()
   =============================================================== */

/* --- Auth guard ----------------------------------------------- */
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

if (!token || !user) {
  window.location.href = "/views/login.html";
}
/* --- Variables globales --------------------------------------- */
let allReservations = [];
let currentFilter = "all";
let pendingCancelId = null;

/* ===============================================================
   INIT INFOS UTILISATEUR
   =============================================================== */
function initUserInfo() {
  if (!user) return;

  const initial = user.nom ? user.nom.charAt(0).toUpperCase() : "?";

  const el = (id) => document.getElementById(id);

  if (el("profile-avatar")) el("profile-avatar").textContent = initial;
  if (el("profile-name"))
    el("profile-name").textContent = user.nom || "Utilisateur";
  if (el("profile-email")) el("profile-email").textContent = user.email || "";
  if (el("info-nom")) el("info-nom").textContent = user.nom || "—";
  if (el("info-email")) el("info-email").textContent = user.email || "—";
  if (el("info-role")) {
    el("info-role").innerHTML = `
      <span style="
        display:inline-flex;align-items:center;gap:6px;
        padding:4px 12px;border-radius:20px;
        background:rgba(201,169,98,0.1);
        border:1px solid rgba(201,169,98,0.22);
        color:#c9a962;font-size:11px;font-weight:700;
        text-transform:uppercase;letter-spacing:0.08em;
      ">${user.role || "client"}</span>`;
  }
}

/* ===============================================================
   TOAST
   =============================================================== */
function showToast(text, type) {
  const toast = document.getElementById("toast");
  const txt = document.getElementById("toast-text");
  const icon = document.getElementById("toast-icon");
  if (!toast || !txt) return;

  toast.className = "toast show " + type;
  txt.textContent = text;

  if (icon) {
    icon.innerHTML =
      type === "success"
        ? '<polyline points="20 6 9 17 4 12"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>';
  }

  setTimeout(() => {
    toast.className = "toast";
  }, 3500);
}

/* ===============================================================
   STATS
   =============================================================== */
function updateStats(data) {
  const total = data.length;
  const confirmees = data.filter((r) => r.statut === "confirmee").length;
  const annulees = data.filter((r) => r.statut === "annulee").length;

  const el = (id) => document.getElementById(id);
  if (el("stat-total")) el("stat-total").textContent = total;
  if (el("stat-confirmees")) el("stat-confirmees").textContent = confirmees;
  if (el("stat-annulees")) el("stat-annulees").textContent = annulees;
}

/* ===============================================================
   CHARGEMENT RESERVATIONS
   =============================================================== */
async function loadReservations() {
  try {
    const res  = await fetch("/api/reservations/mes-reservations", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    allReservations = data;
    updateStats(data);
    renderReservations(data);
  } catch (err) {
    console.error("Erreur chargement reservations:", err);
  }
}

/* ===============================================================
   RENDER RESERVATIONS
   =============================================================== */
function renderReservations(data) {
  const loading = document.getElementById("reservations-loading");
  const list = document.getElementById("reservations-list");
  const empty = document.getElementById("empty-state");

  if (loading) loading.style.display = "none";

  const filtered =
    currentFilter === "all"
      ? data
      : data.filter((r) => r.statut === currentFilter);

  if (filtered.length === 0) {
    if (list) list.style.display = "none";
    if (empty) empty.style.display = "block";
    return;
  }

  if (empty) empty.style.display = "none";
  if (list) list.style.display = "block";

  list.innerHTML = filtered
    .map((r) => {
      const debut = new Date(r.date_debut).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const fin = new Date(r.date_fin).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const isConfirmee = r.statut === "confirmee";
      const isFuture = new Date(r.date_debut) > new Date();

      return `
    <div class="reservation-card" id="resa-${r.id}">

      <div class="reservation-img">
        ${
          r.image_url
            ? `<img src="${r.image_url}" alt="${r.marque} ${r.modele}">`
            : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
               <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
               <rect x="9" y="11" width="14" height="10" rx="2"/>
               <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
             </svg>`
        }
      </div>

      <div class="reservation-info">
        <div class="reservation-car-badge">Réservation #${r.id}</div>
        <div class="reservation-car-name">${r.marque} ${r.modele}</div>
        <div class="reservation-dates">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${debut} → ${fin}
        </div>
        <div class="reservation-price">
          ${parseFloat(r.total_prix).toFixed(2)}DT <span>total</span>
        </div>
      </div>

      <div class="reservation-actions">
        <span class="status-badge ${
          isConfirmee ? "status-confirmee" : "status-annulee"
        }">
          <span class="dot"></span>
          ${isConfirmee ? "Confirmée" : "Annulée"}
        </span>
        ${
          isConfirmee && isFuture
            ? `<button class="btn-annuler" onclick="openCancelModal(${r.id})">Annuler</button>`
            : ""
        }
      </div>

    </div>`;
    })
    .join("");
}

/* ===============================================================
   FILTRES
   =============================================================== */
function initFilters() {
  document.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderReservations(allReservations);
    });
  });
}

/* ===============================================================
   MODAL ANNULATION
   =============================================================== */
function openCancelModal(id) {
  pendingCancelId = id;
  document.getElementById("cancel-modal").classList.add("open");
}

function initModal() {
  const cancelBtn = document.getElementById("modal-cancel-btn");
  const confirmBtn = document.getElementById("modal-confirm-btn");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      document.getElementById("cancel-modal").classList.remove("open");
      pendingCancelId = null;
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      document.getElementById("cancel-modal").classList.remove("open");
      if (!pendingCancelId) return;
      try {
        const res = await fetch(`/api/reservations/${pendingCancelId}/annuler`, {
          method: "PATCH",
          headers: { "Authorization": "Bearer " + token }
        });
        if (!res.ok) { const d = await res.json(); showToast(d.message, "error"); return; }
        allReservations = allReservations.map(r => r.id === pendingCancelId ? { ...r, statut: "annulee" } : r);
        updateStats(allReservations);
        renderReservations(allReservations);
        showToast("Reservation annulee.", "success");
      } catch (err) { showToast("Erreur serveur.", "error"); }
    });
  }
}

/* ===============================================================
   TABS PROFIL
   =============================================================== */
function initTabs() {
  document.querySelectorAll(".profile-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".profile-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const tabName = tab.dataset.tab;
      document.getElementById("tab-reservations").style.display =
        tabName === "reservations" ? "block" : "none";
      document.getElementById("tab-compte").style.display =
        tabName === "compte" ? "block" : "none";
    });
  });
}

/* ===============================================================
   DECONNEXION
   =============================================================== */
function initLogout() {
  const btn = document.getElementById("btn-logout");
  if (!btn) return;
  btn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    window.location.href = "/views/login.html";
  });
}

/* ===============================================================
   INIT
   =============================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initUserInfo();
  initFilters();
  initModal();
  initTabs();
  initLogout();
  loadReservations();
});
