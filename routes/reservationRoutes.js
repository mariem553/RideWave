// reservationRoutes.js — routes API de réservation
// Fournit :
// - POST /api/reservations : création de réservation pour utilisateur connecté
// - GET /api/reservations/mes-reservations : historique de l'utilisateur
// - PATCH /api/reservations/:id/annuler : annulation sécurisée de réservation
// Utilise verifyToken pour protéger les routes et calcule le prix total.
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");

// Prix par jour pour le service chauffeur
const DRIVER_PRICE_PER_DAY = 30;

/** Date locale du serveur au format YYYY-MM-DD */
// Fonction pour obtenir la date actuelle au format YYYY-MM-DD
function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Nombre de jours de location (date_fin exclusive pour le calcul métier courant :
 * du 26 au 27 = 1 jour facturé si même logique que le front).
 */
// Fonction pour calculer le nombre de jours entre deux dates
function rentalDays(dateDebut, dateFin) {
  const start = new Date(dateDebut + "T12:00:00");
  const end = new Date(dateFin + "T12:00:00");
  const diff = end - start;
  if (diff <= 0) return 0;
  return Math.ceil(diff / 86400000);
}

// Route pour créer une nouvelle réservation
router.post("/", verifyToken, async (req, res) => {
  const {
    voiture_id,
    date_debut,
    date_fin,
    num_carte_identite,
    avec_chauffeur,
    prenom,
    nom,
    email,
    telephone,
  } = req.body;
  const userId = req.user.id;

  /* Champs obligatoires (dates + véhicule + infos client pour INSERT) */
  if (
    voiture_id == null ||
    !date_debut ||
    !date_fin ||
    !num_carte_identite ||
    !prenom ||
    !nom ||
    !email ||
    !telephone
  ) {
    return res.status(400).json({
      message:
        "Champs requis : voiture_id, date_debut, date_fin, num_carte_identite, prénom, nom, email, téléphone.",
    });
  }

  const d0 = String(date_debut).trim().slice(0, 10);
  const d1 = String(date_fin).trim().slice(0, 10);
  const today = todayDateString();

  /* date_debut >= aujourd'hui */
  if (d0 < today) {
    return res.status(400).json({
      message: "La date de début ne peut pas être antérieure à aujourd'hui.",
    });
  }

  /* date_fin > date_debut */
  if (d1 <= d0) {
    return res.status(400).json({
      message: "La date de fin doit être strictement postérieure à la date de début.",
    });
  }

  const cin = String(num_carte_identite).trim();
  if (!/^[A-Za-z0-9]{4,20}$/.test(cin)) {
    return res.status(400).json({ message: "Numéro de carte d'identité invalide." });
  }

  const clientPrenom = String(prenom).trim();
  const clientNom = String(nom).trim();
  const clientEmail = String(email).trim();
  const clientTel = String(telephone).trim();

  if (!clientPrenom || !clientNom) {
    return res.status(400).json({ message: "Prénom et nom requis." });
  }

  if (!/^\S+@\S+\.\S+$/.test(clientEmail)) {
    return res.status(400).json({ message: "E-mail invalide." });
  }

  if (!/^[0-9\s+\-]{6,20}$/.test(clientTel)) {
    return res.status(400).json({ message: "Téléphone invalide." });
  }

  try {
    const [cars] = await db.query(
      "SELECT id, prix_jour, disponible FROM voitures WHERE id = ?",
      [voiture_id]
    );
    if (!cars.length) {
      return res.status(404).json({ message: "Voiture introuvable." });
    }
    const car = cars[0];
    if (!car.disponible) {
      return res.status(400).json({ message: "Cette voiture n'est pas disponible à la location." });
    }

    const days = rentalDays(d0, d1);
    if (days <= 0) {
      return res.status(400).json({ message: "Période de location invalide." });
    }

    /**
     * Anti-chevauchement : réservations confirmées sur la même voiture
     * qui se croisent avec [d0, d1].
     */
    const [overlap] = await db.query(
      `SELECT id FROM reservations
       WHERE voiture_id = ?
         AND statut = 'confirmee'
         AND NOT (date_fin <= ? OR date_debut >= ?)`,
      [voiture_id, d0, d1]
    );

    if (overlap.length > 0) {
      return res.status(400).json({
        message: "Voiture non disponible sur ces dates.",
      });
    }

    const prixJour = Number(car.prix_jour);
    /* total de base = nb_jours × prix_jour (option chauffeur en supplément si demandé) */
    const subtotal = prixJour * days;
    const driverExtra = avec_chauffeur ? DRIVER_PRICE_PER_DAY * days : 0;
    const total_prix = subtotal + driverExtra;
    const option_chauffeur = avec_chauffeur ? 1 : 0;

    const [result] = await db.query(
      `INSERT INTO reservations (
         user_id, voiture_id, date_debut, date_fin, num_carte_identite,
         client_prenom, client_nom, client_email, client_telephone,
         option_chauffeur, total_prix, statut
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmee')`,
      [
        userId,
        voiture_id,
        d0,
        d1,
        cin,
        clientPrenom,
        clientNom,
        clientEmail,
        clientTel,
        option_chauffeur,
        total_prix,
      ]
    );

    return res.status(201).json({
      message: "Réservation enregistrée.",
      id: result.insertId,
      total_prix,
      voiture_id,
      date_debut: d0,
      date_fin: d1,
    });
  } catch (err) {
    console.error("[reservationRoutes] POST /", err);
    if (err.code === "ER_BAD_FIELD_ERROR" || /Unknown column/i.test(String(err.message))) {
      return res.status(503).json({
        message:
          "Base de données à jour requise : exécutez database/migration_add_reservation_client.sql dans MySQL.",
        error: err.message,
      });
    }
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.get("/mes-reservations", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.id,
              r.date_debut,
              r.date_fin,
              r.total_prix,
              r.statut,
              r.client_prenom,
              r.client_nom,
              r.client_email,
              r.client_telephone,
              r.num_carte_identite,
              r.option_chauffeur,
              v.marque,
              v.modele,
              v.image_url
       FROM reservations r
       JOIN voitures v ON r.voiture_id = v.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("[reservationRoutes] GET mes-reservations", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.patch("/:id/annuler", verifyToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, user_id, statut FROM reservations WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }
    const r = rows[0];
    if (r.user_id !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé." });
    }
    if (r.statut !== "confirmee") {
      return res.status(400).json({ message: "Cette réservation ne peut pas être annulée." });
    }

    await db.query("UPDATE reservations SET statut = 'annulee' WHERE id = ?", [id]);
    res.json({ message: "Réservation annulée." });
  } catch (err) {
    console.error("[reservationRoutes] PATCH annuler", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;

// Routes de création, consultation et annulation des réservations.

