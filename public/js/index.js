/* ═══════════════════════════════════════════════════════════════
   index.js — page d'accueil RideWave
   Description :
   - charge les véhicules depuis l'API pour l'accueil
   - transforme les données en cartes interactives
   - gère le formulaire de recherche de voyages
   - anime les compteurs et l'interface de témoignages
   - ajoute un curseur personnalisé et des interactions UX
   ═══════════════════════════════════════════════════════════════ */

/* ─── Véhicules : GET /api/voitures (MySQL) — max 6 à l’accueil ─── */

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Transforme la réponse API (mapVoiture) au format des cartes flip */
function mapApiToHomeVehicle(v) {
    const dash = '—';
    const name = `${v.marque} ${v.modele}`;
    const category = (v.categorie || 'Berline').toUpperCase();
    const price = Math.round(Number(v.prix_jour));
    const image = v.photo;
    const description = v.description && String(v.description).trim()
        ? String(v.description).trim()
        : `Location premium : ${v.marque} ${v.modele} (${v.annee}). ${v.places} places · ${v.carburant} · ${v.transmission}.`;
    const specs = {
        power: (v.puissance_cv && String(v.puissance_cv).trim()) || dash,
        speed: (v.vitesse_max_kmh && String(v.vitesse_max_kmh).trim()) || dash,
        acceleration: (v.accel_0_100 && String(v.accel_0_100).trim()) || dash,
    };
    return { id: v.id, name, category, price, image, description, specs };
}

async function loadVehiclesFromAPI() {
    const container = document.getElementById('vehicles-container');
    try {
        const res = await fetch('/api/voitures');
        if (!res.ok) throw new Error('API voitures');
        const raw = await res.json();
        if (!Array.isArray(raw) || raw.length === 0) {
            if (container) {
                container.innerHTML = '<p class="vehicles-empty-msg" style="grid-column:1/-1;text-align:center;color:rgba(245,243,238,0.55);padding:32px;font-size:14px;">Aucun véhicule pour le moment.</p>';
            }
            return;
        }
        let list = raw.filter((v) => v.disponible);
        if (list.length === 0) list = raw.slice(0, 6);
        else list = list.slice(0, 6);
        renderVehicles(list.map(mapApiToHomeVehicle));
    } catch (err) {
        console.error('Erreur chargement voitures:', err);
        if (container) {
            container.innerHTML = '<p class="vehicles-empty-msg" style="grid-column:1/-1;text-align:center;color:rgba(245,243,238,0.55);padding:32px;font-size:14px;">Impossible de charger les véhicules. Réessayez plus tard.</p>';
        }
    }
}

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

    container.innerHTML = data.map(v => {
        const name = escapeHtml(v.name);
        const category = escapeHtml(v.category);
        const desc = escapeHtml(v.description);
        const sp = v.specs || { power: '—', speed: '—', acceleration: '—' };
        const pwr = escapeHtml(sp.power);
        const spd = escapeHtml(sp.speed);
        const acc = escapeHtml(sp.acceleration);
        const imgAlt = escapeHtml(v.name);
        const imgSrc = escapeHtml(v.image);
        return `
        <div class="vehicle-flip-wrapper">
            <div class="vehicle-card-inner">

                <!-- FRONT -->
                <div class="vehicle-card-front">
                    <div class="vehicle-img-wrap">
                        <img src="${imgSrc}" alt="${imgAlt}" class="vehicle-img" loading="lazy">
                        <div class="vehicle-price-badge">
                            ${v.price}DT<span class="price-unit">/jour</span>
                        </div>
                        <div class="vehicle-category-badge">${category}</div>
                    </div>
                    <div class="vehicle-card-body">
                        <h3 class="vehicle-card-name">${name}</h3>
                        <p class="vehicle-card-desc">${desc}</p>
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
                    <span class="back-cat-tag">${category}</span>
                    <h3 class="back-car-name">${name}</h3>
                    <p class="back-car-desc">${desc}</p>

                    <div class="back-specs-grid">
                        <div class="back-spec-item">
                            <div class="back-spec-value">${pwr}</div>
                            <div class="back-spec-label">chevaux</div>
                        </div>
                        <div class="back-spec-item">
                            <div class="back-spec-value">${acc}</div>
                            <div class="back-spec-label">0 – 100</div>
                        </div>
                        <div class="back-spec-item">
                            <div class="back-spec-value">${spd}</div>
                            <div class="back-spec-label">km/h max</div>
                        </div>
                    </div>

                    <div class="back-card-footer">
                        <div class="back-price-display">
                            <span class="back-price-value">${v.price}DT</span>
                            <span class="back-price-unit">par jour</span>
                        </div>
                        <button type="button" class="back-book-btn" onclick="handleBooking(${Number(v.id)})">
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
    `;
    }).join('');
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

        const location    = document.getElementById('location').value;
        const vehicleType = document.getElementById('vehicle-model').value;
        const startDate   = document.getElementById('start-date').value;
        const endDate     = document.getElementById('end-date').value;

        // Validation — identifier les champs vides
        const missingFields = [];
        if (!location) missingFields.push('Lieu de départ');
        if (!vehicleType) missingFields.push('Type de véhicule');
        if (!startDate) missingFields.push('Date de départ');
        if (!endDate) missingFields.push('Date de retour');

        if (missingFields.length > 0) {
            showValidationErrorAlt(missingFields);
            return;
        }

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

        await delay(1500);

        // Créer les URL params
        const params = new URLSearchParams({
            location: location,
            type: vehicleType,
            startDate: startDate,
            endDate: endDate
        });

        // Naviguer vers voiture.html avec les paramètres
        window.location.href = `/views/voiture.html?${params.toString()}`;
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

/* ─── Alternative: Validation Minimale (Version 2) ────────────── */
function showValidationErrorAlt(fields) {
    let existing = document.getElementById('validation-toast-alt');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'validation-toast-alt';
    toast.style.cssText = `
        position: fixed;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        max-width: 520px;
        width: calc(100% - 48px);
        background: rgba(7, 7, 9, 0.92);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(201, 169, 98, 0.25);
        border-radius: 14px;
        padding: 16px 20px;
        color: #f5f3ee;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        line-height: 1.6;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        animation: fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 9998;
    `;

    const content = document.createElement('div');
    content.style.cssText = 'display: flex; align-items: flex-start; gap: 12px;';
    
    const icon = document.createElement('div');
    icon.style.cssText = 'flex-shrink: 0; margin-top: 2px;';
    icon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#daa520" stroke-width="2.5">
            <path d="M12 2L2 20h20L12 2z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    `;

    const text = document.createElement('div');
    text.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 6px; color: #daa520;">Champs manquants</div>
        <div style="opacity: 0.85;">${fields.map(f => `${f}`).join(' • ')}</div>
    `;

    content.appendChild(icon);
    content.appendChild(text);
    toast.appendChild(content);
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOutDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

/* ─── Injection des styles d'animation (une seule fois) ──────── */
if (!document.getElementById('validation-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'validation-toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(420px) translateY(-12px); }
            to   { opacity: 1; transform: translateX(0) translateY(0); }
        }
        @keyframes slideOut {
            from { opacity: 1; transform: translateX(0) translateY(0); }
            to   { opacity: 0; transform: translateX(420px) translateY(-12px); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateX(-50%) translateY(24px); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes fadeOutDown {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to   { opacity: 0; transform: translateX(-50%) translateY(24px); }
        }
    `;
    document.head.appendChild(style);
}

/* ══════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadVehiclesFromAPI();
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

// Script de la page d'accueil : chargement des véhicules, formulaires et animations d'interface.

