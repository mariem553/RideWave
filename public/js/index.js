/* ═══════════════════════════════════════════════════════════════
   index.js — JS SPÉCIFIQUE à la page d'accueil
   Responsable : Yasmine
   Dépend de main.js (chargé avant)
   ═══════════════════════════════════════════════════════════════ */

/* ─── Données statiques — Phase 1 ────────────────────────────── */
/* En Phase 2 : remplacer par GET /api/voitures               */
const VEHICLES = [
    {
        id: 1,
        name: 'Porsche 911 Turbo S',
        category: 'Sport',
        price: 1950,
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
        description: 'The pinnacle of Porsche engineering. An icon refined across generations, delivering breathtaking performance with everyday usability.',
        specs: { power: '650', speed: '330', acceleration: '2.7s' }
    },
    {
        id: 2,
        name: 'Bentley Continental GT',
        category: 'Grand Tourer',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80',
        description: 'The grand tourer reimagined. Where hand-crafted British luxury meets supercar performance across the most demanding roads.',
        specs: { power: '635', speed: '333', acceleration: '3.6s' }
    },
    {
        id: 3,
        name: 'Lamborghini Huracán',
        category: 'Supercar',
        price: 2350,
        image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
        description: "Pure Italian ferocity. The Huracán distills decades of Sant'Agata excellence into a visceral, unforgettable driving experience.",
        specs: { power: '640', speed: '325', acceleration: '2.9s' }
    },
    {
        id: 4,
        name: 'Rolls-Royce Ghost',
        category: 'Luxury',
        price: 2545,
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
        description: 'The most serene vehicle ever crafted. An effortless sanctuary of Starlight headliner, whisper-quiet refinement and unbounded presence.',
        specs: { power: '563', speed: '250', acceleration: '4.8s' }
    },
    {
        id: 5,
        name: 'Ferrari F8 Tributo',
        category: 'Supercar',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
        description: 'A tribute to the most powerful V8 in Ferrari history. Aerodynamic perfection, track-bred dynamics and prancing horse heritage.',
        specs: { power: '720', speed: '340', acceleration: '2.9s' }
    },
    {
        id: 6,
        name: 'Mercedes-Maybach S',
        category: 'Berline',
        price: 1300,
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        description: 'The ultimate expression of automotive luxury. First-class rear accommodation, Burmester 4D surround sound and sculpted Teutonic elegance.',
        specs: { power: '496', speed: '250', acceleration: '4.5s' }
    }
];

const TESTIMONIALS = [
    {
        name: 'Alexandre Durand',
        role: 'CEO, Tech Ventures',
        content: 'Un service d\'une qualité exceptionnelle. La réservation est fluide, chaque véhicule est impeccable et l\'équipe conciergerie toujours présente. Zéro compromis.',
        rating: 5
    },
    {
        name: 'Camille Rousseau',
        role: 'Avocate d\'affaires',
        content: 'RideWave a transformé mes déplacements professionnels. La fiabilité et le service conciergerie font toute la différence. Je recommande sans réserve.',
        rating: 5
    },
    {
        name: 'Marc Beaumont',
        role: 'Entrepreneur',
        content: 'La flotte est remarquable. Chaque location est une expérience premium. Le meilleur service de location de véhicules que j\'ai utilisé — point final.',
        rating: 5
    }
];

/* ══════════════════════════════════════════════════════════════
   RENDER — Flip Cards Véhicules
   ══════════════════════════════════════════════════════════════ */
function renderVehicles(data) {
    const container = document.getElementById('vehicles-container');
    if (!container) return;

    container.innerHTML = data.map(v => `
        <div class="vehicle-flip-wrapper">
            <div class="vehicle-card-inner">

                <!-- FRONT -->
                <div class="vehicle-card-front">
                    <div class="vehicle-img-wrap">
                        <img src="${v.image}" alt="${v.name}" class="vehicle-img" loading="lazy">
                        <div class="vehicle-price-badge">
                            ${v.price}DT<span class="price-unit">/jour</span>
                        </div>
                        <div class="vehicle-category-badge">${v.category}</div>
                    </div>
                    <div class="vehicle-card-body">
                        <h3 class="vehicle-card-name">${v.name}</h3>
                        <p class="vehicle-card-desc">${v.description}</p>
                    </div>
                    <div class="flip-hint">
                        <div class="flip-hint-icon">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 4v6h-6"/>
                                <path d="M1 20v-6h6"/>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                            </svg>
                        </div>
                        Retourner
                    </div>
                </div>

                <!-- BACK -->
                <div class="vehicle-card-back">
                    <span class="back-cat-tag">${v.category}</span>
                    <h3 class="back-car-name">${v.name}</h3>
                    <p class="back-car-desc">${v.description}</p>

                    <div class="back-specs-grid">
                        <div class="back-spec-item">
                            <div class="back-spec-value">${v.specs.power}</div>
                            <div class="back-spec-label">chevaux</div>
                        </div>
                        <div class="back-spec-item">
                            <div class="back-spec-value">${v.specs.acceleration}</div>
                            <div class="back-spec-label">0 – 100</div>
                        </div>
                        <div class="back-spec-item">
                            <div class="back-spec-value">${v.specs.speed}</div>
                            <div class="back-spec-label">km/h max</div>
                        </div>
                    </div>

                    <div class="back-card-footer">
                        <div class="back-price-display">
                            <span class="back-price-value">${v.price}DT</span>
                            <span class="back-price-unit">par jour</span>
                        </div>
                        <button class="back-book-btn" onclick="handleBooking(${v.id})">
                            <span class="btn-text">
                                Réserver
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `).join('');
}

/* ══════════════════════════════════════════════════════════════
   RENDER — Témoignages
   ══════════════════════════════════════════════════════════════ */
function renderTestimonials(data) {
    const container = document.getElementById('testimonials-container');
    if (!container) return;

    const stars = (n) => Array(n).fill(0).map(() => `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#c9a962" stroke="none">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    `).join('');

    container.innerHTML = data.map(t => `
        <div class="testimonial-card">
            <div class="testimonial-stars">${stars(t.rating)}</div>
            <p class="testimonial-quote">"${t.content}"</p>
            <div class="testimonial-author">
                <div class="testimonial-avatar">${t.name.charAt(0)}</div>
                <div>
                    <p class="testimonial-name">${t.name}</p>
                    <p class="testimonial-role">${t.role}</p>
                </div>
            </div>
        </div>
    `).join('');
}

/* ══════════════════════════════════════════════════════════════
   COMPTEURS ANIMÉS
   ══════════════════════════════════════════════════════════════ */
let countersAnimated = false;

function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    document.querySelectorAll('.stat-number[data-target]').forEach(counter => {
        const target   = parseInt(counter.dataset.target);
        const duration = 2400;
        const start    = performance.now();

        (function update(now) {
            const progress = Math.min((now - start) / duration, 1);
            const ease     = 1 - Math.pow(1 - progress, 4);
            const value    = Math.floor(ease * target);
            counter.textContent = value.toLocaleString('fr-FR') + (progress >= 1 ? '+' : '');
            if (progress < 1) requestAnimationFrame(update);
        })(start);
    });
}

/* ══════════════════════════════════════════════════════════════
   BOOKING FORM
   ══════════════════════════════════════════════════════════════ */
function setupBookingForm() {
    const form      = document.getElementById('rental-form');
    const startDate = document.getElementById('start-date');
    const endDate   = document.getElementById('end-date');
    const selectV   = document.getElementById('vehicle-model');
    if (!form || !startDate || !endDate) return;

    startDate.min = new Date().toISOString().split('T')[0];

    function mark(el) {
        el.value ? el.classList.add('has-value') : el.classList.remove('has-value');
    }

    if (selectV) selectV.addEventListener('change', () => mark(selectV));

    startDate.addEventListener('change', () => {
        mark(startDate);
        endDate.min = startDate.value;
        if (endDate.value && endDate.value <= startDate.value) {
            const d = new Date(startDate.value);
            d.setDate(d.getDate() + 1);
            endDate.value = d.toISOString().split('T')[0];
            mark(endDate);
        }
    });
    endDate.addEventListener('change', () => mark(endDate));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn  = form.querySelector('.btn-luxury');
        const orig = btn.innerHTML;

        btn.innerHTML = '<span class="btn-inner">Recherche en cours...</span>';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        await delay(1500);

        btn.innerHTML = `
            <span class="btn-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Résultats trouvés !
            </span>`;

        await delay(2000);
        btn.innerHTML = orig;
        btn.disabled = false;
        btn.style.opacity = '';
    });
}

/* ══════════════════════════════════════════════════════════════
   CONTACT FORM
   ══════════════════════════════════════════════════════════════ */
function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    // Select "Sujet" — même comportement que #vehicle-model
    const contactSubject = document.getElementById('contact-subject');
    if (contactSubject) {
        contactSubject.addEventListener('change', () => {
            contactSubject.value
                ? contactSubject.classList.add('has-value')
                : contactSubject.classList.remove('has-value');
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn  = form.querySelector('.btn-luxury');
        const orig = btn.innerHTML;

        btn.innerHTML = '<span class="btn-inner">Envoi en cours...</span>';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        await delay(1200);

        btn.innerHTML = `
            <span class="btn-inner">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Message envoyé !
            </span>`;

        await delay(2200);
        btn.innerHTML = orig;
        btn.disabled = false;
        btn.style.opacity = '';
        form.reset();

        // Remettre la couleur grise après reset
        if (contactSubject) contactSubject.classList.remove('has-value');
    });
}

/* ══════════════════════════════════════════════════════════════
   LOGIQUE DE RÉSERVATION (depuis le bouton flip card)
   ══════════════════════════════════════════════════════════════ */
function handleBooking(vehicleId) {
    const token = localStorage.getItem('token');

    if (!token) {
        sessionStorage.setItem('voiture_id', vehicleId);
        window.location.href = '/views/login.html';
    } else {
        window.location.href = `/views/reservation.html?voiture_id=${vehicleId}`;
    }
}

/* ══════════════════════════════════════════════════════════════
   CURSEUR CUSTOM (uniquement sur la home)
   ══════════════════════════════════════════════════════════════ */
function setupCursor() {
    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    if (window.matchMedia('(hover: none)').matches) {
        dot.style.display  = 'none';
        ring.style.display = 'none';
        return;
    }

    let mouseX = -200, mouseY = -200;
    let ringX  = -200, ringY  = -200;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    (function animateRing() {
        ringX += (mouseX - ringX) * 0.13;
        ringY += (mouseY - ringY) * 0.13;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
    })();

    const INTERACTIVE = 'a, button, input, select, textarea, .vehicle-flip-wrapper, .stat-item, .nav-link, .service-card, .testimonial-card';

    document.addEventListener('mouseover', e => {
        if (e.target.closest(INTERACTIVE)) {
            dot.classList.add('hovering');
            ring.classList.add('visible', 'hovering');
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(INTERACTIVE)) {
            dot.classList.remove('hovering');
            ring.classList.remove('visible', 'hovering');
        }
    });

    document.addEventListener('mousedown', () => {
        dot.classList.add('clicking');
        ring.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
        dot.classList.remove('clicking');
        ring.classList.remove('clicking');
    });

    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ''; });
}

/* ══════════════════════════════════════════════════════════════
   UTILITAIRE
   ══════════════════════════════════════════════════════════════ */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    renderVehicles(VEHICLES);
    renderTestimonials(TESTIMONIALS);

    setupBookingForm();
    setupContactForm();

    setupCursor();

    if (window.RW_setupScrollReveal) {
        window.RW_setupScrollReveal(animateCounters);
    }

    const exploreBtn = document.getElementById('btn-explore');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            document.getElementById('vehicles')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

/* ══════════════════════════════════════════════════════════════
   PHASE 2 — À décommenter quand le backend est prêt
   ══════════════════════════════════════════════════════════════ */
/*
async function loadVehiclesFromAPI() {
    try {
        const res  = await fetch('/api/voitures?limit=6');
        const data = await res.json();
        renderVehicles(data);
    } catch (err) {
        console.error('Erreur chargement voitures:', err);
        renderVehicles(VEHICLES);
    }
}
*/