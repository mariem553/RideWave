(function () {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const path = window.location.pathname

  // Charger le HTML de la sidebar
  fetch('/views/admin/sidebar.html')
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML('afterbegin', html)
      document.body.classList.add('admin-layout')

      // Remplir les infos utilisateur
      document.getElementById('sidebar-nom').textContent = user.nom || 'Administrateur'
      document.getElementById('sidebar-email').textContent = user.email || ''

      // Surligner le lien actif
      if (path.includes('dashboard'))    document.getElementById('link-dashboard').classList.add('active')
      if (path.includes('voitures'))     document.getElementById('link-voitures').classList.add('active')
      if (path.includes('reservations')) document.getElementById('link-reservations').classList.add('active')
    })
})()

function adminLogout() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  window.location.href = '/admin'
}