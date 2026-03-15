/* ═══════════════════════════════════════════════════════════════
   main.js — JS COMMUN — RIDEWAVE
   Responsable : Mariem
   Injecté sur TOUTES les pages. Ne pas modifier sans accord.
   ═══════════════════════════════════════════════════════════════ */

/* ─── HTML de la Navbar ──────────────────────────────────────── */
const NAV_HTML = `
<nav class="nav-container" id="navbar">
    <div style="max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;">

        <a href="/views/acceuil.html" class="nav-logo">
            <div class="nav-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#070709" stroke-width="2.5">
                    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                    <rect x="9" y="11" width="14" height="10" rx="2"/>
                    <circle cx="12" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                </svg>
            </div>
            <span class="nav-logo-text">RIDE<span class="wave">Wave</span></span>
        </a>

        <ul class="nav-links">
            <li><a href="/views/voitures.html"   class="nav-link" data-page="voitures">Collection</a></li>
            <li><a href="/views/acceuil.html#services" class="nav-link">Services</a></li>
            <li><a href="/views/acceuil.html#about"    class="nav-link">À propos</a></li>
            <li><a href="/views/acceuil.html#contact-section" class="nav-link">Contact</a></li>
        </ul>

        <div class="nav-actions">
            <a href="/views/login.html"    class="nav-signin" id="nav-signin-link">Connexion</a>
            <a href="/views/profile.html"  class="nav-signin" id="nav-profile-link" style="display:none;">Mon Profil</a>
            <a href="/views/reservation.html" class="btn-reserve"><span>Réserver</span></a>
            <button class="nav-hamburger" id="nav-hamburger" aria-label="Menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>
</nav>

<div class="nav-mobile-menu" id="nav-mobile-menu">
    <button id="nav-mobile-close" style="position:absolute;top:24px;right:24px;background:none;border:none;color:var(--fg);font-size:24px;cursor:pointer;">✕</button>
    <a href="/views/voitures.html" class="nav-link">Collection</a>
    <a href="/views/acceuil.html#services" class="nav-link">Services</a>
    <a href="/views/acceuil.html#about" class="nav-link">À propos</a>
    <a href="/views/acceuil.html#contact-section" class="nav-link">Contact</a>
    <a href="/views/login.html" class="btn-reserve" style="margin-top:16px;"><span>Connexion</span></a>
</div>
`;

/* ─── HTML du Footer ─────────────────────────────────────────── */
const FOOTER_HTML = `
<footer class="site-footer">
    <div style="max-width:1280px;margin:0 auto;">
        <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr;gap:32px;margin-bottom:0;"
             class="footer-grid">

            <div class="footer-brand">
                <a href="/views/acceuil.html" class="nav-logo" style="margin-bottom:12px;display:inline-flex;">
                    <div class="nav-logo-icon" style="width:34px;height:34px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#070709" stroke-width="2.5">
                            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                            <rect x="9" y="11" width="14" height="10" rx="2"/>
                            <circle cx="12" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                        </svg>
                    </div>
                    <span class="nav-logo-text" style="font-size:1.1rem;">RIDE<span class="wave">Wave</span></span>
                </a>
                <p>Excellence en location de véhicules premium depuis 2012. Chaque trajet, extraordinaire.</p>
            </div>

            <div>
                <h4 class="footer-heading">Entreprise</h4>
                <ul class="footer-links">
                    <li><a href="#">À propos</a></li>
                    <li><a href="#">Carrières</a></li>
                    <li><a href="#">Presse</a></li>
                </ul>
            </div>

            <div>
                <h4 class="footer-heading">Services</h4>
                <ul class="footer-links">
                    <li><a href="#">Court terme</a></li>
                    <li><a href="#">Long terme</a></li>
                    <li><a href="#">Chauffeur</a></li>
                </ul>
            </div>

            <div>
                <h4 class="footer-heading">Support</h4>
                <ul class="footer-links">
                    <li><a href="#">Centre d'aide</a></li>
                    <li><a href="#">FAQ</a></li>
                </ul>
            </div>

            <div>
                <h4 class="footer-heading">Contact</h4>
                <ul class="footer-links">
                    <li><a href="/views/acceuil.html#contact-section">Envoyer un message</a></li>
                    <li><a href="tel:+33123456789">+33 1 23 45 67 89</a></li>
                    <li><a href="mailto:hello@ridewave.com">hello@ridewave.com</a></li>
                    <li><a href="#">Confidentialité</a></li>
                    <li><a href="#">CGU</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <p class="footer-copy">© 2024 RideWave. Tous droits réservés.</p>
            <div class="footer-socials">
                <a href="#" class="footer-social-link" aria-label="Instagram">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                </a>
                <a href="#" class="footer-social-link" aria-label="LinkedIn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                        <rect x="2" y="9" width="4" height="12"/>
                        <circle cx="4" cy="4" r="2"/>
                    </svg>
                </a>
                <a href="#" class="footer-social-link" aria-label="Twitter">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</footer>
`;

/* ─── Injection navbar + footer ──────────────────────────────── */
function injectLayout() {
    // Navbar
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.outerHTML = NAV_HTML;
    } else {
        // Injection en haut du body si pas de placeholder
        document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
    }

    // Footer
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        footerPlaceholder.outerHTML = FOOTER_HTML;
    } else {
        document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);
    }
}

/* ─── Active nav link (selon la page courante) ───────────────── */
function setActiveNavLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && path.includes(href.replace('#','').split('#')[0]) && !href.startsWith('#')) {
            link.classList.add('active');
        }
    });
}

/* ─── Scroll → navbar solid ─────────────────────────────────── */
function setupNavScroll() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.pageYOffset > 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // état initial
}

/* ─── Mobile hamburger ───────────────────────────────────────── */
function setupMobileMenu() {
    const burger = document.getElementById('nav-hamburger');
    const menu   = document.getElementById('nav-mobile-menu');
    const close  = document.getElementById('nav-mobile-close');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => menu.classList.add('open'));
    if (close) close.addEventListener('click', () => menu.classList.remove('open'));

    // Fermer si clic sur un lien
    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => menu.classList.remove('open'));
    });
}

/* ─── Auth state (navbar dynamique) ─────────────────────────── */
function updateNavAuth() {
    const token      = localStorage.getItem('token');
    const signinLink  = document.getElementById('nav-signin-link');
    const profileLink = document.getElementById('nav-profile-link');
    if (!signinLink || !profileLink) return;

    if (token) {
        signinLink.style.display  = 'none';
        profileLink.style.display = '';
    } else {
        signinLink.style.display  = '';
        profileLink.style.display = 'none';
    }
}

/* ─── Scroll Reveal (IntersectionObserver commun) ────────────── */
function setupScrollReveal(counterCallback) {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                // Callback optionnel pour les compteurs
                if (counterCallback && e.target.id === 'stats-section') {
                    counterCallback();
                }
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-up, .reveal-scale, .stagger-container').forEach(el => {
        io.observe(el);
    });
}

/* ─── Responsive footer grid ─────────────────────────────────── */
function makeFooterResponsive() {
    const grid = document.querySelector('.footer-grid');
    if (!grid) return;
    const update = () => {
        if (window.innerWidth < 768) {
            grid.style.gridTemplateColumns = '1fr 1fr';
        } else if (window.innerWidth < 1024) {
            grid.style.gridTemplateColumns = '2fr 1fr 1fr';
        } else {
            grid.style.gridTemplateColumns = '2fr 1fr 1fr 1fr 1fr';
        }
    };
    window.addEventListener('resize', update);
    update();
}

/* ─── Init principal ─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    injectLayout();
    setActiveNavLink();
    setupNavScroll();
    setupMobileMenu();
    updateNavAuth();
    makeFooterResponsive();

    // Expose setupScrollReveal globalement pour que acceuil.js puisse passer le callback
    window.RW_setupScrollReveal = setupScrollReveal;
});