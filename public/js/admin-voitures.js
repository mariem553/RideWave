/* ═══════════════════════════════════════════════════════════
   admin-voitures.js — RideWave Admin
   ═══════════════════════════════════════════════════════════ */
'use strict';

const API_VOITURES = '/api/voitures';
const USE_MOCK     = true; // Phase 1

/* ── Données mock ── */
let voitures = [
  { id:1,  marque:'Mercedes-Benz', modele:'Classe E 220d',       annee:2026, prix_jour:320, disponible:true,  categorie:'Berline',    carburant:'Diesel',     transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80' },
  { id:2,  marque:'BMW',           modele:'Série 5 530i',        annee:2026, prix_jour:350, disponible:true,  categorie:'Berline',    carburant:'Essence',    transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80' },
  { id:3,  marque:'Audi',          modele:'A6 Quattro',          annee:2026, prix_jour:280, disponible:false, categorie:'Berline',    carburant:'Essence',    transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80' },
  { id:4,  marque:'Porsche',       modele:'Cayenne S',           annee:2026, prix_jour:480, disponible:true,  categorie:'SUV',        carburant:'Essence',    transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80' },
  { id:5,  marque:'Range Rover',   modele:'Velar P400',          annee:2026, prix_jour:420, disponible:true,  categorie:'SUV',        carburant:'Essence',    transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80' },
  { id:6,  marque:'Tesla',         modele:'Model 3 Performance', annee:2026, prix_jour:290, disponible:true,  categorie:'Électrique', carburant:'Électrique', transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80' },
  { id:7,  marque:'Mercedes-Benz', modele:'GLE 450 AMG',         annee:2026, prix_jour:500, disponible:false, categorie:'SUV',        carburant:'Hybride',    transmission:'Auto',   places:7, photo:'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800&q=80' },
  { id:8,  marque:'Volkswagen',    modele:'Passat Business',     annee:2026, prix_jour:140, disponible:true,  categorie:'Berline',    carburant:'Diesel',     transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&q=80' },
  { id:9,  marque:'Toyota',        modele:'RAV4 Hybrid',         annee:2026, prix_jour:165, disponible:true,  categorie:'SUV',        carburant:'Hybride',    transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80' },
  { id:10, marque:'Audi',          modele:'Q7 S-Line',           annee:2026, prix_jour:390, disponible:true,  categorie:'SUV',        carburant:'Diesel',     transmission:'Auto',   places:7, photo:'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80' },
  { id:11, marque:'BMW',           modele:'X5 xDrive40i',        annee:2026, prix_jour:440, disponible:false, categorie:'SUV',        carburant:'Essence',    transmission:'Auto',   places:5, photo:'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80' },
  { id:12, marque:'Volkswagen',    modele:'Golf 8 GTI',          annee:2026, prix_jour:110, disponible:true,  categorie:'Compacte',   carburant:'Essence',    transmission:'Manuel', places:5, photo:'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80' },
];

let selected  = null;
let editingId = null;

/* ════════════════════════════
   STATS
════════════════════════════ */
function updateStats() {
  const total  = voitures.length;
  const dispo  = voitures.filter(v => v.disponible).length;
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
    const matchDispo = dispo==='' || (dispo==='1' ? v.disponible : !v.disponible);
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
    body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--muted);font-size:12px">Aucune voiture trouvée</div>`;
    return;
  }
  body.innerHTML = data.map(v => `
    <div class="list-row${selected?.id===v.id?' active':''}" onclick="selectVoiture(${v.id})">
      <img class="list-thumb" src="${v.photo}" onerror="this.src=''" alt="${v.marque} ${v.modele}"/>
      <div class="list-info">
        <div class="list-name">${v.marque} ${v.modele}</div>
        <div class="list-meta"><span>${v.categorie}</span><span>·</span><span>${v.carburant}</span></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="list-price">${v.prix_jour} TND</div>
        <span class="${v.disponible?'badge-on':'badge-off'}">${v.disponible?'Dispo':'Indispo'}</span>
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

function renderDetail() {
  const v = selected;
  document.getElementById('detail-panel').innerHTML = `
    <div class="detail-img-wrap">
      <img src="${v.photo}" onerror="this.style.display='none'" alt="${v.marque} ${v.modele}"/>
      <div class="detail-img-badge">
        <span class="${v.disponible?'badge-on':'badge-off'}">${v.disponible?'Disponible':'Indisponible'}</span>
      </div>
    </div>
    <div>
      <div class="detail-cat">${v.categorie} · #${String(v.id).padStart(3,'0')}</div>
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
      <button class="btn-edit" onclick="openEdit(${v.id})">Modifier</button>
      <button class="btn-del"  onclick="deleteVoiture(${v.id})">🗑</button>
    </div>`;
}

/* ════════════════════════════
   MODAL ADD / EDIT
════════════════════════════ */
function openAdd() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Ajouter une voiture';
  document.getElementById('form-marque').value      = '';
  document.getElementById('form-modele').value      = '';
  document.getElementById('form-annee').value       = '2026';
  document.getElementById('form-prix').value        = '';
  document.getElementById('form-cat').value         = 'Berline';
  document.getElementById('form-carburant').value   = 'Essence';
  document.getElementById('form-transmission').value= 'Auto';
  document.getElementById('form-places').value      = '5';
  document.getElementById('form-photo').value       = '';
  document.getElementById('form-dispo').checked     = true;
  document.getElementById('modal-overlay').classList.add('open');
}

function openEdit(id) {
  editingId = id;
  const v = voitures.find(x => x.id === id);
  document.getElementById('modal-title').textContent = 'Modifier la voiture';
  document.getElementById('form-marque').value       = v.marque;
  document.getElementById('form-modele').value       = v.modele;
  document.getElementById('form-annee').value        = v.annee;
  document.getElementById('form-prix').value         = v.prix_jour;
  document.getElementById('form-cat').value          = v.categorie;
  document.getElementById('form-carburant').value    = v.carburant;
  document.getElementById('form-transmission').value = v.transmission;
  document.getElementById('form-places').value       = v.places;
  document.getElementById('form-photo').value        = v.photo;
  document.getElementById('form-dispo').checked      = v.disponible;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function saveVoiture() {
  const marque       = document.getElementById('form-marque').value.trim();
  const modele       = document.getElementById('form-modele').value.trim();
  const annee        = parseInt(document.getElementById('form-annee').value);
  const prix         = parseFloat(document.getElementById('form-prix').value);
  const cat          = document.getElementById('form-cat').value;
  const carburant    = document.getElementById('form-carburant').value;
  const transmission = document.getElementById('form-transmission').value;
  const places       = parseInt(document.getElementById('form-places').value);
  const photo        = document.getElementById('form-photo').value.trim();
  const dispo        = document.getElementById('form-dispo').checked;

  if (!marque || !modele || !annee || !prix) {
    showToast('Veuillez remplir les champs obligatoires.', 'error');
    return;
  }

  if (editingId) {
    voitures = voitures.map(v => v.id === editingId
      ? { ...v, marque, modele, annee, prix_jour:prix, categorie:cat, carburant, transmission, places, photo:photo||v.photo, disponible:dispo }
      : v);
    if (selected?.id === editingId) selected = voitures.find(v => v.id === editingId);
    showToast('Voiture modifiée avec succès', 'success');

    /* Phase 2 :
    await fetch(`${API_VOITURES}/${editingId}`, { method:'PUT', headers:{'Authorization':..., 'Content-Type':'application/json'}, body:JSON.stringify({...}) });
    */
  } else {
    const newId = Math.max(...voitures.map(v => v.id)) + 1;
    const newV  = { id:newId, marque, modele, annee, prix_jour:prix, categorie:cat, carburant, transmission, places, photo:photo||'', disponible:dispo };
    voitures.push(newV);
    selected = newV;
    showToast('Voiture ajoutée avec succès', 'success');

    /* Phase 2 :
    const formData = new FormData(); // si upload fichier
    await fetch(API_VOITURES, { method:'POST', headers:{'Authorization':...}, body:formData });
    */
  }

  closeModal();
  updateStats();
  renderList();
  if (selected) renderDetail();
}

function deleteVoiture(id) {
  if (!confirm('Supprimer cette voiture définitivement ?')) return;
  voitures = voitures.filter(v => v.id !== id);
  selected = voitures.length > 0 ? voitures[0] : null;
  updateStats();
  renderList();
  if (selected) renderDetail();
  else document.getElementById('detail-panel').innerHTML = `<div class="empty">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,98,0.25)" stroke-width="1.5">
      <path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/>
    </svg>Sélectionnez une voiture</div>`;

  /* Phase 2 :
  await fetch(`${API_VOITURES}/${id}`, { method:'DELETE', headers:{'Authorization':...} });
  */
}

/* Close modal on overlay click */
document.getElementById('modal-overlay')?.addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

/* ════════════════════════════
   INIT
════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (!initSidebar('voitures')) return;

  const tDate = document.getElementById('tDate');
  if (tDate) tDate.textContent = new Date().toLocaleDateString('fr-FR',{ weekday:'long', day:'numeric', month:'long' });

  updateStats();
  renderList();
  selectVoiture(1);
  hideLoading();
});