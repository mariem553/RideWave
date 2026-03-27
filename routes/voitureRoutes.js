const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { mapVoiture } = require("../utils/mapVoiture");

const SELECT_VOITURE = `SELECT id, marque, modele, annee, prix_jour, image_url, disponible,
  categorie, carburant, transmission, places,
  description, puissance_cv, vitesse_max_kmh, accel_0_100
  FROM voitures`;

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`${SELECT_VOITURE} ORDER BY id ASC`);
    res.json(rows.map(mapVoiture));
  } catch (err) {
    console.error("[voitureRoutes] GET /", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalide" });
  }
  try {
    const [rows] = await db.query(`${SELECT_VOITURE} WHERE id = ?`, [id]);
    if (!rows.length) {
      return res.status(404).json({ message: "Voiture non trouvée" });
    }
    res.json(mapVoiture(rows[0]));
  } catch (err) {
    console.error("[voitureRoutes] GET /:id", err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;
