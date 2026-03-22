(function () {

  // ── Charger admin.css ──
  const css = document.createElement('link')
  css.rel = 'stylesheet'
  css.href = '/css/admin.css'
  document.head.appendChild(css)

  // ── Charger Google Fonts ──
  const fonts = document.createElement('link')
  fonts.rel = 'stylesheet'
  fonts.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=DM+Sans:wght@300;400;500;600&display=swap'
  document.head.appendChild(fonts)

  // ── Injecter la sidebar ──
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const path = window.location.pathname

  fetch('/admin/sidebar.html')
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

})()

function adminLogout() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('adminUser')
  window.location.href = '/admin'
}