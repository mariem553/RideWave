const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { verifyAdmin } = require("../middleware/auth");

// GET toutes les voitures
router.get("/", async (req, res) => {
  try {
    const [voitures] = await db.query("SELECT * FROM voitures");
    res.json(voitures);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// GET une voiture par id
router.get("/:id", async (req, res) => {
  try {
    const [voitures] = await db.query("SELECT * FROM voitures WHERE id = ?", [req.params.id]);
    if (voitures.length === 0) return res.status(404).json({ message: "Voiture non trouvée" });
    res.json(voitures[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// POST ajouter une voiture (admin)
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { marque, modele, annee, prix_jour, image_url } = req.body;
    const [result] = await db.query(
      "INSERT INTO voitures (marque, modele, annee, prix_jour, image_url) VALUES (?, ?, ?, ?, ?)",
      [marque, modele, annee, prix_jour, image_url]
    );
    res.status(201).json({ message: "Voiture ajoutée", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// PUT modifier une voiture (admin)
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { marque, modele, annee, prix_jour, image_url, disponible } = req.body;
    await db.query(
      "UPDATE voitures SET marque=?, modele=?, annee=?, prix_jour=?, image_url=?, disponible=? WHERE id=?",
      [marque, modele, annee, prix_jour, image_url, disponible, req.params.id]
    );
    res.json({ message: "Voiture modifiée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

// DELETE supprimer une voiture (admin)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM voitures WHERE id = ?", [req.params.id]);
    res.json({ message: "Voiture supprimée" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});

module.exports = router;x
