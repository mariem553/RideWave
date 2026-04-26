/* ═══════════════════════════════════════════════════════════════
   main.js — scripts communs RideWave
   Description :
   - active le lien de navigation selon la page chargée
   - fait passer la barre de navigation en mode scrolled
   - gère le menu mobile et la fermeture des liens
   - met à jour l'état auth pour la barre de navigation
   - initialise le scroll vers l'ancre et le reveal global
   ═══════════════════════════════════════════════════════════════ */

/* ─── Active nav link (selon la page courante) ───────────────── */
function setActiveNavLink() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('#') && path.includes(href.split('#')[0]) && href !== '#') {
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
    onScroll();
}

/* ─── Mobile hamburger ───────────────────────────────────────── */
function setupMobileMenu() {
    const burger = document.getElementById('nav-hamburger');
    const menu   = document.getElementById('nav-mobile-menu');
    const close  = document.getElementById('nav-mobile-close');
    if (!burger || !menu) return;

    burger.addEventListener('click', () => menu.classList.add('open'));
    if (close) close.addEventListener('click', () => menu.classList.remove('open'));

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => menu.classList.remove('open'));
    });
}

/* ─── Auth state (navbar dynamique) ─────────────────────────── */
function updateNavAuth() {
    const token       = localStorage.getItem('token');
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

/* ─── Auto-scroll si on arrive avec #ancre dans l'URL ────────── */
function setupAnchorAutoScroll() {
    const path = window.location.pathname;
    const isHomePage = path === '/' || path === '' || path.endsWith('/index.html');

    if (isHomePage && window.location.hash) {
        const anchor = window.location.hash.replace('#', '');
        setTimeout(() => {
            const target = document.getElementById(anchor);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}

/* ─── Scroll Reveal (IntersectionObserver commun) ────────────── */
function setupScrollReveal(counterCallback) {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
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
    setActiveNavLink();
    setupNavScroll();
    setupMobileMenu();
    updateNavAuth();
    makeFooterResponsive();
    setupAnchorAutoScroll();

    window.RW_setupScrollReveal = setupScrollReveal;
});

// Fonctions partagées pour toutes les pages : navigation, menu mobile, état auth et behavior commun.
