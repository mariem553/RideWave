/* ═══════════════════════════════════════════════════════════
   adminRoutes.js — RideWave
   Chemin : routes/adminRoutes.js
   ═══════════════════════════════════════════════════════════ */

const express         = require("express");
const router          = express.Router();
const db              = require("../config/db");
const { verifyAdmin } = require("../middleware/auth");
const { mapVoiture }  = require("../utils/mapVoiture");

const SELECT_VOITURE_ROW = `SELECT id, marque, modele, annee, prix_jour, image_url, disponible,
  categorie, carburant, transmission, places,
  description, puissance_cv, vitesse_max_kmh, accel_0_100
  FROM voitures`;

function parsePresentationFields(body) {
  const description =
    body.description != null && String(body.description).trim() !== ""
      ? String(body.description).trim()
      : null;
  const opt = (k, max) => {
    const x = body[k];
    if (x == null || String(x).trim() === "") return null;
    return String(x).trim().slice(0, max);
  };
  return {
    description,
    puissance_cv: opt("puissance_cv", 20),
    vitesse_max_kmh: opt("vitesse_max_kmh", 20),
    accel_0_100: opt("accel_0_100", 20),
  };
}

function parseVoitureDetails(body) {
  const categorie =
    body.categorie != null && String(body.categorie).trim() !== ""
      ? String(body.categorie).trim().slice(0, 60)
      : "Berline";
  const carburant =
    body.carburant != null && String(body.carburant).trim() !== ""
      ? String(body.carburant).trim().slice(0, 60)
      : "Essence";
  const transmission =
    body.transmission != null && String(body.transmission).trim() !== ""
      ? String(body.transmission).trim().slice(0, 60)
      : "Auto";
  let places = parseInt(body.places, 10);
  if (Number.isNaN(places) || places < 1) places = 5;
  if (places > 99) places = 99;
  return { categorie, carburant, transmission, places };
}

/* ════════════════════════════════════════
   GET /api/admin/stats
   Route protégée verifyAdmin
   Retourne :
   - totalVoitures
   - voituresDisponibles
   - reservationsConfirmees
   - reservationsAnnulees
   - dernieresReservations (5 dernières)
════════════════════════════════════════ */
router.get("/stats", verifyAdmin, async (req, res) => {
  try {

    /* 1. Total voitures */
    const [[{ totalVoitures }]] = await db.query(
      `SELECT COUNT(*) AS totalVoitures FROM voitures`
    );

    /* 2. Voitures disponibles */
    const [[{ voituresDisponibles }]] = await db.query(
      `SELECT COUNT(*) AS voituresDisponibles FROM voitures WHERE disponible = 1`
    );

    /* 3. Réservations confirmées */
    const [[{ reservationsConfirmees }]] = await db.query(
      `SELECT COUNT(*) AS reservationsConfirmees FROM reservations WHERE statut = 'confirmee'`
    );

    /* 4. Réservations annulées */
    const [[{ reservationsAnnulees }]] = await db.query(
      `SELECT COUNT(*) AS reservationsAnnulees FROM reservations WHERE statut = 'annulee'`
    );

    /* 5. Les 5 dernières réservations */
    const [dernieresReservations] = await db.query(
      `SELECT
         r.id,
         u.nom        AS client,
         v.marque,
         v.modele,
         r.date_debut AS dateDebut,
         r.date_fin   AS dateFin,
         r.total_prix AS totalPrix,
         r.statut,
         r.created_at AS createdAt
       FROM reservations r
       JOIN users    u ON r.user_id    = u.id
       JOIN voitures v ON r.voiture_id = v.id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );

    res.json({
      totalVoitures,
      voituresDisponibles,
      reservationsConfirmees,
      reservationsAnnulees,
      dernieresReservations,
    });

  } catch (err) {
    console.error("[adminRoutes] /stats error:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});
router.patch("/reservations/:id/annuler", verifyAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, statut FROM reservations WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }
    
    if (rows[0].statut !== "confirmee") {
      return res.status(400).json({ message: "Cette réservation ne peut pas être annulée." });
    }

    await db.query("UPDATE reservations SET statut = 'annulee' WHERE id = ?", [id]);
    res.json({ message: "Réservation annulée par l'administrateur." });
  } catch (err) {
    console.error("[adminRoutes] PATCH annuler", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

/* ════════════════════════════════════════
   GET /api/admin/reservations
   Route protégée verifyAdmin
   Query params optionnels :
   ?statut=confirmee|annulee
   ?date=YYYY-MM-DD
   ?limit=20&offset=0
════════════════════════════════════════ */
router.get("/reservations", verifyAdmin, async (req, res) => {
  try {
    const { statut, date, limit = 20, offset = 0 } = req.query;

    const conditions = [];
    const params     = [];

    if (statut) {
      conditions.push(`r.statut = ?`);
      params.push(statut);
    }

    if (date) {
      conditions.push(`r.date_debut = ?`);
      params.push(date);
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [reservations] = await db.query(
      `SELECT
         r.id,
         u.nom        AS client,
         u.email      AS clientEmail,
         v.marque,
         v.modele,
         v.prix_jour  AS prixJour,
         r.date_debut AS dateDebut,
         r.date_fin   AS dateFin,
         r.total_prix AS totalPrix,
         r.statut,
         r.created_at AS createdAt
       FROM reservations r
       JOIN users    u ON r.user_id    = u.id
       JOIN voitures v ON r.voiture_id = v.id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    /* Total pour pagination */
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM reservations r ${where}`,
      params
    );

    res.json({ reservations, total });

  } catch (err) {
    console.error("[adminRoutes] /reservations error:", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

/* ════════════════════════════════════════
   POST /api/admin/voitures — Créer (MySQL)
════════════════════════════════════════ */
router.post("/voitures", verifyAdmin, async (req, res) => {
  try {
    const { marque, modele, annee, prix_jour, image_url, disponible } = req.body;
    const details = parseVoitureDetails(req.body);
    const pres = parsePresentationFields(req.body);

    if (!marque || !modele || annee == null || prix_jour == null) {
      return res.status(400).json({
        message: "marque, modele, annee et prix_jour sont requis.",
      });
    }

    const anneeNum = parseInt(annee, 10);
    const prix = parseFloat(prix_jour);
    if (Number.isNaN(anneeNum) || Number.isNaN(prix) || prix < 0) {
      return res.status(400).json({ message: "Année ou prix invalide." });
    }

    const dispo = disponible === true || disponible === 1 || disponible === "1" ? 1 : 0;
    const img =
      image_url != null && String(image_url).trim() !== ""
        ? String(image_url).trim()
        : null;

    const [result] = await db.query(
      `INSERT INTO voitures (marque, modele, annee, prix_jour, image_url, disponible,
        categorie, carburant, transmission, places,
        description, puissance_cv, vitesse_max_kmh, accel_0_100)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(marque).trim(),
        String(modele).trim(),
        anneeNum,
        prix,
        img,
        dispo,
        details.categorie,
        details.carburant,
        details.transmission,
        details.places,
        pres.description,
        pres.puissance_cv,
        pres.vitesse_max_kmh,
        pres.accel_0_100,
      ]
    );

    const [[row]] = await db.query(`${SELECT_VOITURE_ROW} WHERE id = ?`, [
      result.insertId,
    ]);

    res.status(201).json(mapVoiture(row));
  } catch (err) {
    console.error("[adminRoutes] POST /voitures", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

/* ════════════════════════════════════════
   PUT /api/admin/voitures/:id — Modifier
════════════════════════════════════════ */
router.put("/voitures/:id", verifyAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const { marque, modele, annee, prix_jour, image_url, disponible } = req.body;
    const details = parseVoitureDetails(req.body);
    const pres = parsePresentationFields(req.body);

    if (!marque || !modele || annee == null || prix_jour == null) {
      return res.status(400).json({
        message: "marque, modele, annee et prix_jour sont requis.",
      });
    }

    const anneeNum = parseInt(annee, 10);
    const prix = parseFloat(prix_jour);
    if (Number.isNaN(anneeNum) || Number.isNaN(prix) || prix < 0) {
      return res.status(400).json({ message: "Année ou prix invalide." });
    }

    const dispo = disponible === true || disponible === 1 || disponible === "1" ? 1 : 0;
    const img =
      image_url != null && String(image_url).trim() !== ""
        ? String(image_url).trim()
        : null;

    const [upd] = await db.query(
      `UPDATE voitures SET marque = ?, modele = ?, annee = ?, prix_jour = ?, image_url = ?, disponible = ?,
        categorie = ?, carburant = ?, transmission = ?, places = ?,
        description = ?, puissance_cv = ?, vitesse_max_kmh = ?, accel_0_100 = ?
       WHERE id = ?`,
      [
        String(marque).trim(),
        String(modele).trim(),
        anneeNum,
        prix,
        img,
        dispo,
        details.categorie,
        details.carburant,
        details.transmission,
        details.places,
        pres.description,
        pres.puissance_cv,
        pres.vitesse_max_kmh,
        pres.accel_0_100,
        id,
      ]
    );

    if (upd.affectedRows === 0) {
      return res.status(404).json({ message: "Voiture introuvable." });
    }

    const [[row]] = await db.query(`${SELECT_VOITURE_ROW} WHERE id = ?`, [id]);

    res.json(mapVoiture(row));
  } catch (err) {
    console.error("[adminRoutes] PUT /voitures/:id", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

/* ════════════════════════════════════════
   DELETE /api/admin/voitures/:id
════════════════════════════════════════ */
router.delete("/voitures/:id", verifyAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  try {
    const [[{ c }]] = await db.query(
      "SELECT COUNT(*) AS c FROM reservations WHERE voiture_id = ?",
      [id]
    );

    if (c > 0) {
      return res.status(400).json({
        message:
          "Impossible de supprimer : des réservations sont liées à ce véhicule.",
      });
    }

    const [del] = await db.query("DELETE FROM voitures WHERE id = ?", [id]);
    if (del.affectedRows === 0) {
      return res.status(404).json({ message: "Voiture introuvable." });
    }

    res.json({ message: "Voiture supprimée." });
  } catch (err) {
    console.error("[adminRoutes] DELETE /voitures/:id", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;