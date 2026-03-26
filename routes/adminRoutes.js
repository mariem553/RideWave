/* ═══════════════════════════════════════════════════════════
   adminRoutes.js — RideWave
   Chemin : routes/adminRoutes.js
   ═══════════════════════════════════════════════════════════ */

const express         = require("express");
const router          = express.Router();
const db              = require("../config/db");
const { verifyAdmin } = require("../middleware/auth");

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

module.exports = router;