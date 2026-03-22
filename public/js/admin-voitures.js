// ── Données statiques en attendant le backend ──
const voituresData = [
  { id: 1, marque: 'Porsche', modele: '911 Carrera', annee: 2023, prix_jour: 320, disponible: 1, image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80' },
  { id: 2, marque: 'Ferrari', modele: 'Roma', annee: 2022, prix_jour: 580, disponible: 1, image_url: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=400&q=80' },
  { id: 3, marque: 'Mercedes', modele: 'AMG GT', annee: 2023, prix_jour: 280, disponible: 0, image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80' },
  { id: 4, marque: 'Lamborghini', modele: 'Huracán', annee: 2022, prix_jour: 750, disponible: 1, image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { id: 5, marque: 'BMW', modele: 'M8 Compétition', annee: 2023, prix_jour: 240, disponible: 1, image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80' },
]

let voitures = [...voituresData]
let editingId = null

// ── Sidebar ──
function loadSidebar() {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const path = window.location.pathname

  fetch('/views/admin/sidebar.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html)
      document.body.classList.add('admin-layout')

      document.getElementById('sidebar-nom').textContent = user.nom || 'Administrateur'
      document.getElementById('sidebar-email').textContent = user.email || ''

      if (path.includes('dashboard'))    document.getElementById('link-dashboard').classList.add('active')
      if (path.includes('voitures'))     document.getElementById('link-voitures').classList.add('active')
      if (path.includes('reservations')) document.getElementById('link-reservations').classList.add('active')
    })
}

// ── Tableau ──
function renderTable() {
  const tbody = document.getElementById('voitures-tbody')
  if (voitures.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:#5a5a65;">Aucune voiture</td></tr>`
    return
  }
  tbody.innerHTML = voitures.map(v => `
    <tr>
      <td>
        <img
          src="${v.image_url}"
          alt="${v.marque}"
          class="car-thumb"
          onerror="this.src='https://via.placeholder.com/60x40/0c0c10/c9a962?text=?'"
        />
      </td>
      <td style="font-weight:500;">${v.marque}</td>
      <td>${v.modele}</td>
      <td style="color:#5a5a65;">${v.annee}</td>
      <td style="color:#c9a962;font-weight:600;">${v.prix_jour} €<span style="font-size:10px;color:#5a5a65;"> /jour</span></td>
      <td>
        <span class="badge-dispo ${v.disponible ? 'on' : 'off'}">
          ${v.disponible ? 'Disponible' : 'Indisponible'}
        </span>
      </td>
      <td>
        <div style="display:flex;gap:8px;">
          <button class="btn-modifier" onclick="openEdit(${v.id})">Modifier</button>
          <button class="btn-supprimer" onclick="deleteVoiture(${v.id})">Supprimer</button>
        </div>
      </td>
    </tr>
  `).join('')
}

// ── Modal Ajouter ──
function openAdd() {
  editingId = null
  document.getElementById('modal-title').textContent = 'Ajouter une voiture'
  document.getElementById('form-marque').value = ''
  document.getElementById('form-modele').value = ''
  document.getElementById('form-annee').value = ''
  document.getElementById('form-prix').value = ''
  document.getElementById('form-image').value = ''
  document.getElementById('form-dispo').checked = true
  document.getElementById('modal-overlay').classList.add('open')
}

// ── Modal Modifier ──
function openEdit(id) {
  editingId = id
  const v = voitures.find(x => x.id === id)
  document.getElementById('modal-title').textContent = 'Modifier la voiture'
  document.getElementById('form-marque').value = v.marque
  document.getElementById('form-modele').value = v.modele
  document.getElementById('form-annee').value = v.annee
  document.getElementById('form-prix').value = v.prix_jour
  document.getElementById('form-image').value = v.image_url
  document.getElementById('form-dispo').checked = v.disponible === 1
  document.getElementById('modal-overlay').classList.add('open')
}

// ── Fermer Modal ──
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open')
}

// ── Enregistrer ──
function saveVoiture() {
  const marque = document.getElementById('form-marque').value.trim()
  const modele = document.getElementById('form-modele').value.trim()
  const annee  = document.getElementById('form-annee').value.trim()
  const prix   = document.getElementById('form-prix').value.trim()
  const image  = document.getElementById('form-image').value.trim()
  const dispo  = document.getElementById('form-dispo').checked ? 1 : 0

  if (!marque || !modele || !annee || !prix) {
    alert('Veuillez remplir tous les champs obligatoires.')
    return
  }

  if (editingId) {
    voitures = voitures.map(v => v.id === editingId
      ? { ...v, marque, modele, annee: parseInt(annee), prix_jour: parseInt(prix), image_url: image || v.image_url, disponible: dispo }
      : v
    )
  } else {
    const newId = Math.max(...voitures.map(v => v.id)) + 1
    voitures.push({
      id: newId,
      marque,
      modele,
      annee: parseInt(annee),
      prix_jour: parseInt(prix),
      image_url: image || `https://via.placeholder.com/400x300/0c0c10/c9a962?text=${marque}`,
      disponible: dispo
    })
  }

  closeModal()
  renderTable()
}

// ── Supprimer ──
function deleteVoiture(id) {
  if (!confirm('Supprimer cette voiture ?')) return
  voitures = voitures.filter(v => v.id !== id)
  renderTable()
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadSidebar()
  renderTable()

  // Fermer modal en cliquant dehors
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal()
  })
})

function adminLogout() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  window.location.href = '/admin'
}