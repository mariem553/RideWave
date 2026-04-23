/* ═══════════════════════════════════════════════════════════
   admin-voitures.js — RideWave Admin (données MySQL)
   ═══════════════════════════════════════════════════════════ */
'use strict';

const API_VOITURES       = '/api/voitures';
const API_ADMIN_VOITURES = '/api/admin/voitures';

let voitures  = [];
let selected  = null;
let editingId = null;

function adminHeaders() {
  const t = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
}

async function loadVoitures() {
  const res = await fetch(API_VOITURES);
  if (!res.ok) throw new Error('Chargement des voitures');
  voitures = await res.json();
}

/* ════════════════════════════
   STATS
════════════════════════════ */
function updateStats() {
  const total = voitures.length;
  const dispo = voitures.filter(v => v.disponible).length;
  document.getElementById('stat-total').textContent   = `${total} total`;
  document.getElementById('stat-dispo').textContent   = `${dispo} disponibles`;
  document.getElementById('stat-indispo').textContent = `${total - dispo} indisponibles`;
  document.getElementById('fleet-subtitle').textContent = `Flotte RideWave · ${total} véhicules`;
}

/* ════════════════════════════
   FILTRAGE
════════════════════════════ */
function getFiltered() {
  const q     = document.getElementById('search').value.toLowerCase();
  const cat   = document.getElementById('f-cat').value;
  const dispo = document.getElementById('f-dispo').value;
  return voitures.filter(v => {
    const matchQ     = `${v.marque} ${v.modele}`.toLowerCase().includes(q);
    const matchCat   = !cat   || v.categorie === cat;
    const matchDispo = dispo === '' || (dispo === '1' ? v.disponible : !v.disponible);
    return matchQ && matchCat && matchDispo;
  });
}

/* ════════════════════════════
   RENDER LISTE
════════════════════════════ */
function renderList() {
  const data = getFiltered();
  const body = document.getElementById('list-body');
  if (!data.length) {
    body.innerHTML = `<div style="text-align:center;padding:40px 32px;color:var(--muted);font-size:12px">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,98,0.2)" stroke-width="1.5" style="margin:0 auto 10px;display:block">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      Aucune voiture trouvée
    </div>`;
    return;
  }
  body.innerHTML = data.map(v => `
    <div class="list-row${selected?.id === v.id ? ' active' : ''}" onclick="selectVoiture(${v.id})">
      <img class="list-thumb" src="${v.photo}" onerror="this.src=''" alt="${v.marque} ${v.modele}"/>
      <div class="list-info">
        <div class="list-name">${v.marque} ${v.modele}</div>
        <div class="list-meta"><span>${v.categorie}</span><span>·</span><span>${v.carburant}</span></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="list-price">${v.prix_jour} TND</div>
        <span class="${v.disponible ? 'badge-on' : 'badge-off'}">${v.disponible ? 'Dispo' : 'Indispo'}</span>
      </div>
    </div>`).join('');
}

/* ════════════════════════════
   SELECT + DETAIL
════════════════════════════ */
function selectVoiture(id) {
  selected = voitures.find(v => v.id === id);
  renderList();
  renderDetail();
}

const EMPTY_DETAIL = `<div class="empty">
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,98,0.2)" stroke-width="1.5">
    <path d="M5 17H3v-5l2-5h14l2 5v5h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
  Sélectionnez une voiture
</div>`;

function renderDetail() {
  const v = selected;
  if (!v) {
    document.getElementById('detail-panel').innerHTML = EMPTY_DETAIL;
    return;
  }
  document.getElementById('detail-panel').innerHTML = `
    <div class="detail-img-wrap">
      <img src="${v.photo}" onerror="this.style.display='none'" alt="${v.marque} ${v.modele}"/>
      <div class="detail-img-badge">
        <span class="${v.disponible ? 'badge-on' : 'badge-off'}">${v.disponible ? 'Disponible' : 'Indisponible'}</span>
      </div>
    </div>
    <div>
      <div class="detail-cat">${v.categorie} · #${String(v.id).padStart(3, '0')}</div>
      <div class="detail-name">${v.marque} ${v.modele}</div>
    </div>
    <div class="detail-price-wrap">
      <div class="detail-price">${v.prix_jour.toLocaleString('fr-TN')}</div>
      <div class="detail-price-unit">TND / jour</div>
    </div>
    <div class="detail-grid">
      <div class="detail-cell"><div class="detail-cell-label">Année</div><div class="detail-cell-val">${v.annee}</div></div>
      <div class="detail-cell"><div class="detail-cell-label">Places</div><div class="detail-cell-val">${v.places} places</div></div>
      <div class="detail-cell"><div class="detail-cell-label">Carburant</div><div class="detail-cell-val">${v.carburant}</div></div>
      <div class="detail-cell"><div class="detail-cell-label">Transmission</div><div class="detail-cell-val">${v.transmission}</div></div>
    </div>
    <div class="detail-btns">
      <button class="btn-edit" onclick="openEdit(${v.id})">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="margin-right:6px;vertical-align:-2px">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Modifier
      </button>
      <button class="btn-del" onclick="openDeleteConfirm(${v.id})" title="Supprimer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>`;
}

/* ════════════════════════════
   MODALE CONFIRMATION SUPPRESSION
════════════════════════════ */
let _pendingDeleteId = null;

function openDeleteConfirm(id) {
  const v = voitures.find(x => x.id === id);
  if (!v) return;
  _pendingDeleteId = id;

  document.getElementById('confirm-car-name').textContent = `${v.marque} ${v.modele}`;
  document.getElementById('confirm-overlay').classList.add('open');
}

function closeDeleteConfirm() {
  document.getElementById('confirm-overlay').classList.remove('open');
  _pendingDeleteId = null;
}

async function confirmDelete() {
  const id = _pendingDeleteId;
  if (id == null) return;
  closeDeleteConfirm();

  try {
    const res = await fetch(`${API_ADMIN_VOITURES}/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('adminToken');
      window.location.href = '/views/login.html';
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(data.message || 'Suppression impossible.', 'error');
      return;
    }

    showToast('Voiture supprimée avec succès.', 'success');
    await loadVoitures();
    updateStats();
    const keepId = selected && selected.id !== id ? selected.id : null;
    if (keepId && voitures.some(v => v.id === keepId)) {
      selectVoiture(keepId);
    } else if (voitures.length) {
      selectVoiture(voitures[0].id);
    } else {
      selected = null;
      renderList();
      renderDetail();
    }
  } catch (e) {
    console.error(e);
    showToast('Erreur réseau ou serveur.', 'error');
  }
}

/* ════════════════════════════
   MODAL ADD / EDIT
════════════════════════════ */
function openAdd() {
  editingId = null;
  document.getElementById('modal-title').textContent     = 'Ajouter une voiture';
  document.getElementById('form-marque').value           = '';
  document.getElementById('form-modele').value           = '';
  document.getElementById('form-annee').value            = '2026';
  document.getElementById('form-prix').value             = '';
  document.getElementById('form-cat').value              = 'Berline';
  document.getElementById('form-carburant').value        = 'Essence';
  document.getElementById('form-transmission').value     = 'Auto';
  document.getElementById('form-places').value           = '5';
  document.getElementById('form-photo').value            = '';
  document.getElementById('form-description').value      = '';
  document.getElementById('form-puissance').value        = '';
  document.getElementById('form-vmax').value             = '';
  document.getElementById('form-accel').value            = '';
  document.getElementById('form-dispo').checked          = true;
  document.getElementById('modal-overlay').classList.add('open');
}

function openEdit(id) {
  editingId = id;
  const v = voitures.find(x => x.id === id);
  if (!v) return;
  document.getElementById('modal-title').textContent      = 'Modifier la voiture';
  document.getElementById('form-marque').value            = v.marque;
  document.getElementById('form-modele').value            = v.modele;
  document.getElementById('form-annee').value             = v.annee;
  document.getElementById('form-prix').value              = v.prix_jour;
  document.getElementById('form-cat').value               = v.categorie;
  document.getElementById('form-carburant').value         = v.carburant;
  document.getElementById('form-transmission').value      = v.transmission;
  document.getElementById('form-places').value            = v.places;
  document.getElementById('form-photo').value             = v.photo;
  document.getElementById('form-description').value       = v.description != null ? String(v.description) : '';
  document.getElementById('form-puissance').value         = v.puissance_cv != null ? String(v.puissance_cv) : '';
  document.getElementById('form-vmax').value              = v.vitesse_max_kmh != null ? String(v.vitesse_max_kmh) : '';
  document.getElementById('form-accel').value             = v.accel_0_100 != null ? String(v.accel_0_100) : '';
  document.getElementById('form-dispo').checked           = v.disponible;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

async function saveVoiture() {
  const marque       = document.getElementById('form-marque').value.trim();
  const modele       = document.getElementById('form-modele').value.trim();
  const annee        = parseInt(document.getElementById('form-annee').value, 10);
  const prix         = parseFloat(document.getElementById('form-prix').value);
  const categorie    = document.getElementById('form-cat').value.trim();
  const carburant    = document.getElementById('form-carburant').value.trim();
  const transmission = document.getElementById('form-transmission').value.trim();
  const places       = parseInt(document.getElementById('form-places').value, 10);
  const photo        = document.getElementById('form-photo').value.trim();
  const description  = document.getElementById('form-description').value.trim();
  const puissance    = document.getElementById('form-puissance').value.trim();
  const vmax         = document.getElementById('form-vmax').value.trim();
  const accel        = document.getElementById('form-accel').value.trim();
  const dispo        = document.getElementById('form-dispo').checked;

  if (!marque || !modele || Number.isNaN(annee) || Number.isNaN(prix)) {
    showToast('Veuillez remplir les champs obligatoires.', 'error');
    return;
  }

  const body = {
    marque,
    modele,
    annee,
    prix_jour: prix,
    image_url: photo || '',
    disponible: dispo,
    categorie: categorie || 'Berline',
    carburant: carburant || 'Essence',
    transmission: transmission || 'Auto',
    places: Number.isNaN(places) || places < 1 ? 5 : Math.min(99, places),
    description: description || null,
    puissance_cv: puissance || null,
    vitesse_max_kmh: vmax || null,
    accel_0_100: accel || null,
  };

  try {
    let res;
    if (editingId) {
      res = await fetch(`${API_ADMIN_VOITURES}/${editingId}`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch(API_ADMIN_VOITURES, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(body),
      });
    }

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('adminToken');
      window.location.href = '/views/login.html';
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(data.message || "Erreur lors de l'enregistrement.", 'error');
      return;
    }

    const newId = editingId || data.id;
    showToast(editingId ? 'Voiture modifiée avec succès' : 'Voiture ajoutée avec succès', 'success');
    closeModal();
    await loadVoitures();
    updateStats();
    renderList();
    if (newId != null) selectVoiture(newId);
    else if (voitures.length) selectVoiture(voitures[0].id);
    else { selected = null; renderDetail(); }
  } catch (e) {
    console.error(e);
    showToast('Erreur réseau ou serveur.', 'error');
  }
}

/* ════════════════════════════
   KEYBOARD + OVERLAY CLOSE
════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeDeleteConfirm();
  }
});

document.getElementById('modal-overlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

document.getElementById('confirm-overlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('confirm-overlay')) closeDeleteConfirm();
});

/* ════════════════════════════
   INIT
════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  if (!initSidebar('voitures')) return;

  const tDate = document.getElementById('tDate');
  if (tDate) tDate.textContent = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  try {
    await loadVoitures();
    updateStats();
    renderList();
    if (voitures.length) selectVoiture(voitures[0].id);
    else { selected = null; renderDetail(); }
  } catch (e) {
    console.error(e);
    showToast('Impossible de charger les voitures depuis le serveur.', 'error');
    selected = null;
    renderDetail();
  }
  hideLoading();
});