/* ═══════════════════════════════════════════════════════════════
   reservation.js — Page Réservation
   Voitures et enregistrement via API (MySQL)
   ═══════════════════════════════════════════════════════════════ */

const DRIVER_PRICE_PER_DAY = 30;

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

/** { id, name, category, price, image } — rempli depuis GET /api/voitures/:id */
let currentCar = null;

function showFatal(msg) {
  document.body.innerHTML = `<div style="padding:120px 24px;max-width:560px;margin:0 auto;"><p style="color:var(--muted);">${msg}</p><p style="margin-top:12px;"><a href="/voiture" style="color:var(--accent);">Retour à la flotte</a></p></div>`;
}

function bindReservationForm() {
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

  updateCalculations();
}

async function initReservationPage() {
  const voitureId = parseInt(getQueryParam("voiture_id"), 10);

  if (!voitureId) {
    showFatal("Paramètre voiture manquant.");
    return;
  }

  try {
    const res = await fetch(`/api/voitures/${voitureId}`);
    if (!res.ok) {
      showFatal("Voiture non trouvée.");
      return;
    }
    const data = await res.json();
    currentCar = {
      id: data.id,
      name: `${data.marque} ${data.modele}`,
      category: data.categorie,
      price: data.prix_jour,
      image: data.photo,
    };
  } catch (e) {
    console.error("[reservation]", e);
    showFatal("Impossible de contacter le serveur ou la base de données.");
    return;
  }

  const carImage = document.getElementById("car-image");
  const carName = document.getElementById("car-name");
  const carCategory = document.getElementById("car-category");
  const carPrice = document.getElementById("car-price");

  if (carImage) carImage.src = currentCar.image;
  if (carName) carName.textContent = currentCar.name;
  if (carCategory) carCategory.textContent = currentCar.category;
  if (carPrice) carPrice.textContent = `${currentCar.price} DT / jour`;

  bindReservationForm();
}

async function confirmReservation() {
  const startInput = document.getElementById("start-date");
  const endInput = document.getElementById("end-date");
  const driverCheckbox = document.getElementById("driver-option");
  const confirmMsg = document.getElementById("confirmation-msg");

  const token = localStorage.getItem("token");
  if (!token) {
    if (confirmMsg) {
      confirmMsg.style.display = "block";
      confirmMsg.style.background = "rgba(239, 68, 68, 0.1)";
      confirmMsg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      confirmMsg.style.color = "#fca5a5";
      confirmMsg.textContent = "Connexion requise. Redirection…";
    }
    setTimeout(() => { window.location.href = "/views/login.html"; }, 1200);
    return;
  }

  const firstName = document.getElementById("client-first-name")?.value.trim();
  const lastName = document.getElementById("client-last-name")?.value.trim();
  const email = document.getElementById("client-email")?.value.trim();
  const phone = document.getElementById("client-phone")?.value.trim();
  const cin = document.getElementById("client-cin")?.value.trim();

  if (!firstName || !lastName || !email || !phone || !cin) {
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

  const cinRegex = /^[A-Za-z0-9]{4,20}$/;
  if (!cinRegex.test(cin)) {
    if (confirmMsg) {
      confirmMsg.style.display = "block";
      confirmMsg.style.background = "rgba(239, 68, 68, 0.1)";
      confirmMsg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      confirmMsg.style.color = "#fca5a5";
      confirmMsg.textContent = "Veuillez entrer un numéro de carte d'identité valide (4 à 20 caractères alphanumériques).";
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

  let apiData;
  try {
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        voiture_id: currentCar.id,
        date_debut: startDate,
        date_fin: endDate,
        num_carte_identite: cin,
        avec_chauffeur: !!hasDriver,
        prenom: firstName,
        nom: lastName,
        email,
        telephone: phone,
      }),
    });
    apiData = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (confirmMsg) {
        confirmMsg.style.display = "block";
        confirmMsg.style.background = "rgba(239, 68, 68, 0.1)";
        confirmMsg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
        confirmMsg.style.color = "#fca5a5";
        confirmMsg.textContent = apiData.message || "Erreur lors de l'enregistrement.";
      }
      return;
    }
  } catch (e) {
    console.error(e);
    if (confirmMsg) {
      confirmMsg.style.display = "block";
      confirmMsg.style.background = "rgba(239, 68, 68, 0.1)";
      confirmMsg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      confirmMsg.style.color = "#fca5a5";
      confirmMsg.textContent = "Erreur réseau ou serveur.";
    }
    return;
  }

  const total = apiData.total_prix != null ? Number(apiData.total_prix) : 0;

  const message = `
    ✓ Réservation enregistrée (base MySQL) — n° ${apiData.id}
    ${currentCar.name}
    Client: ${firstName} ${lastName}
    E-mail: ${email}
    Téléphone: ${phone}
    Carte d'identité (CIN): ${cin}
    Du ${formatDate(startDate)} au ${formatDate(endDate)} (${days} jour${days > 1 ? 's' : ''})
    Total: ${total.toFixed(2)} DT ${hasDriver ? '(avec chauffeur)' : ''}
  `.trim();

  if (confirmMsg) {
    confirmMsg.style.display = "block";
    confirmMsg.style.background = "rgba(13, 148, 136, 0.1)";
    confirmMsg.style.border = "1px solid rgba(13, 148, 136, 0.3)";
    confirmMsg.style.color = "#5eead4";
    confirmMsg.textContent = message;
  }
}

document.addEventListener("DOMContentLoaded", initReservationPage);
