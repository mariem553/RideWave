/* layout.js */

const PAGES = {
  dashboard:    { url: '/admin/dashboard',    css: '',                              js: '/js/admin-dashboard.js'    },
  reservations: { url: '/admin/reservations', css: '/css/admin-reservations.css',  js: '/js/admin-reservations.js' },
  voitures:     { url: '/admin/voitures',     css: '/css/admin-voitures.css',       js: '/js/admin-voitures.js'     },
};

async function loadPage(name) {
  const page = PAGES[name];
  if (!page) return;

  /* 1. Fetch la page */
  const res  = await fetch(page.url);
  const html = await res.text();

  /* 2. Extraire juste le <body> */
  const doc     = new DOMParser().parseFromString(html, 'text/html');
  const content = doc.querySelector('.topbar')?.outerHTML + 
                  doc.querySelector('.content')?.outerHTML || '';

  /* 3. Injecter dans #page */
  document.getElementById('page').innerHTML = content;

  /* 4. Charger le CSS de la page */
  document.getElementById('page-css')?.remove();
  if (page.css) {
    const link = document.createElement('link');
    link.id   = 'page-css';
    link.rel  = 'stylesheet';
    link.href = page.css;
    document.head.appendChild(link);
  }

  /* 5. Charger le JS de la page */
  document.getElementById('page-js')?.remove();
  const script = document.createElement('script');
  script.id   = 'page-js';
  script.src  = page.js;
  document.body.appendChild(script);

  /* 6. Mettre à jour l'URL */
  history.pushState({ page: name }, '', page.url);

  /* 7. Lien actif sidebar */
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.sb-link[data-page="${name}"]`)?.classList.add('active');
}

/* Intercepter les clics sidebar */
document.querySelectorAll('.sb-link[data-page]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    loadPage(link.dataset.page);
  });
});

/* Bouton retour navigateur */
window.addEventListener('popstate', e => {
  if (e.state?.page) loadPage(e.state.page);
});

/* Charger dashboard par défaut */
loadPage('dashboard');