/* ═══════════════════════════════════════════════════════════════
   reservation.js — Page Réservation
   Données fictives pour les voitures
   ═══════════════════════════════════════════════════════════════ */

// Données fictives (copy from index.js)
const VEHICLES = [
    {
        id: 1,
        name: 'Porsche 911 Turbo S',
        category: 'Sport',
        price: 1950,
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80',
    },
    {
        id: 2,
        name: 'Bentley Continental GT',
        category: 'Grand Tourer',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800&q=80',
    },
    {
        id: 3,
        name: 'Lamborghini Huracán',
        category: 'Supercar',
        price: 2350,
        image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    },
    {
        id: 4,
        name: 'Rolls-Royce Ghost',
        category: 'Luxury',
        price: 2545,
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80',
    },
    {
        id: 5,
        name: 'Ferrari F8 Tributo',
        category: 'Supercar',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    },
    {
        id: 6,
        name: 'Mercedes-Maybach S',
        category: 'Berline',
        price: 1300,
        image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    }
];

const DRIVER_PRICE_PER_DAY = 30; // DT par jour

function getQueryParam(key) {
  const url = new URL(window.location.href);
  return url.searchParams.get(key);
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const msDay = 86400000;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  if (diff <= 0) return 0;
  return Math.ceil(diff / msDay);
}

function updateCalculations() {
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  const driverCheckbox = document.getElementById("driver-option");
  
  const startDate = startInput?.value;
  const endDate = endInput?.value;
  const days = calculateDays(startDate, endDate);

  // Récapitulatif
  const recapPriceDay = document.getElementById("recap-price-day");
  const recapDays = document.getElementById("recap-days");
  const recapSubtotal = document.getElementById("recap-subtotal");
  const recapDriver = document.getElementById("recap-driver");
  const recapTotal = document.getElementById("recap-total");

  if (!currentCar) return;

  const priceDay = currentCar.price;
  const subtotal = priceDay * days;
  const driverCost = driverCheckbox?.checked ? DRIVER_PRICE_PER_DAY * days : 0;
  const total = subtotal + driverCost;

  if (recapPriceDay) recapPriceDay.textContent = `${priceDay} DT`;
  if (recapDays) recapDays.textContent = days;
  if (recapSubtotal) recapSubtotal.textContent = `${subtotal} DT`;
  if (recapDriver) recapDriver.textContent = driverCost > 0 ? `${driverCost} DT` : "0 DT";
  if (recapTotal) recapTotal.textContent = `${total} DT`;
}

let currentCar = null;

function initReservationPage() {
  const voitureId = parseInt(getQueryParam("voiture_id"), 10);
  
  currentCar = VEHICLES.find(v => v.id === voitureId);
  
  if (!currentCar) {
    document.body.innerHTML = '<div style="padding: 120px 24px;"><p style="color: var(--muted);">Voiture non trouvée.</p></div>';
    return;
  }

  // Afficher la voiture
  const carImage = document.getElementById("car-image");
  const carName = document.getElementById("car-name");
  const carCategory = document.getElementById("car-category");
  const carPrice = document.getElementById("car-price");

  if (carImage) carImage.src = currentCar.image;
  if (carName) carName.textContent = currentCar.name;
  if (carCategory) carCategory.textContent = currentCar.category;
  if (carPrice) carPrice.textContent = `${currentCar.price} DT / jour`;

  // Dates min/max
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  const driverCheckbox = document.getElementById("driver-option");
  const btnConfirm = document.getElementById("btn-confirm");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isoToday = today.toISOString().slice(0, 10);
  const isoTomorrow = tomorrow.toISOString().slice(0, 10);

  if (startInput) {
    startInput.min = isoToday;
    startInput.value = isoToday;
  }

  if (endInput) {
    endInput.min = isoTomorrow;
    endInput.value = isoTomorrow;
  }

  // Event listeners
  if (startInput) {
    startInput.addEventListener("change", () => {
      if (endInput) {
        const start = new Date(startInput.value);
        const minEnd = new Date(start);
        minEnd.setDate(minEnd.getDate() + 1);
        endInput.min = minEnd.toISOString().slice(0, 10);
        
        if (endInput.value <= startInput.value) {
          endInput.value = minEnd.toISOString().slice(0, 10);
        }
      }
      updateCalculations();
    });
  }

  if (endInput) {
    endInput.addEventListener("change", updateCalculations);
  }

  if (driverCheckbox) {
    driverCheckbox.addEventListener("change", updateCalculations);
  }

  if (btnConfirm) {
    btnConfirm.addEventListener("click", confirmReservation);
  }

  // Init calcul
  updateCalculations();
}

function confirmReservation() {
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  const driverCheckbox = document.getElementById("driver-option");
  const confirmMsg = document.getElementById("confirmation-msg");

  const firstName = document.getElementById("client-first-name")?.value.trim();
  const lastName = document.getElementById("client-last-name")?.value.trim();
  const email = document.getElementById("client-email")?.value.trim();
  const phone = document.getElementById("client-phone")?.value.trim();

  if (!firstName || !lastName || !email || !phone) {
    if (confirmMsg) {
      confirmMsg.style.display = "block";
      confirmMsg.style.background = "rgba(239, 68, 68, 0.1)";
      confirmMsg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      confirmMsg.style.color = "#fca5a5";
      confirmMsg.textContent = "Tous les champs personnels sont obligatoires.";
    }
    return;
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    if (confirmMsg) {
      confirmMsg.style.display = "block";
      confirmMsg.style.background = "rgba(239, 68, 68, 0.1)";
      confirmMsg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      confirmMsg.style.color = "#fca5a5";
      confirmMsg.textContent = "Veuillez entrer une adresse e-mail valide.";
    }
    return;
  }

  const phoneRegex = /^[0-9\s+\-]{6,20}$/;
  if (!phoneRegex.test(phone)) {
    if (confirmMsg) {
      confirmMsg.style.display = "block";
      confirmMsg.style.background = "rgba(239, 68, 68, 0.1)";
      confirmMsg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      confirmMsg.style.color = "#fca5a5";
      confirmMsg.textContent = "Veuillez entrer un numéro de téléphone valide.";
    }
    return;
  }

  const startDate = startInput?.value;
  const endDate = endInput?.value;
  const days = calculateDays(startDate, endDate);

  if (!startDate || !endDate || days <= 0) {
    if (confirmMsg) {
      confirmMsg.style.display = "block";
      confirmMsg.style.background = "rgba(239, 68, 68, 0.1)";
      confirmMsg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      confirmMsg.style.color = "#fca5a5";
      confirmMsg.textContent = "Veuillez sélectionner des dates valides.";
    }
    return;
  }

  const hasDriver = driverCheckbox?.checked;
  const subtotal = currentCar.price * days;
  const driverCost = hasDriver ? DRIVER_PRICE_PER_DAY * days : 0;
  const total = subtotal + driverCost;

  const message = `
    ✓ Réservation confirmée !
    ${currentCar.name}
    Client: ${firstName} ${lastName}
    E-mail: ${email}
    Téléphone: ${phone}
    Du ${formatDate(startDate)} au ${formatDate(endDate)} (${days} jour${days > 1 ? 's' : ''})
    Total: ${total} DT ${hasDriver ? '(avec chauffeur)' : ''}
  `.trim();

  if (confirmMsg) {
    confirmMsg.style.display = "block";
    confirmMsg.style.background = "rgba(13, 148, 136, 0.1)";
    confirmMsg.style.border = "1px solid rgba(13, 148, 136, 0.3)";
    confirmMsg.style.color = "#5eead4";
    confirmMsg.textContent = message;
  }
}

/* ────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", initReservationPage);
