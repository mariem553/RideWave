const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/voitures — Liste publique
router.get("/", async (req, res) => {
  try {
    let query = "SELECT * FROM voitures WHERE 1=1"
    const params = []

    // Query params optionnels : ?disponible=1 ?marque=Toyota ?limit=4
    if (req.query.disponible !== undefined) {
      query += " AND disponible = ?"
      params.push(req.query.disponible)
    }
    if (req.query.marque) {
      query += " AND marque = ?"
      params.push(req.query.marque)
    }
    if (req.query.limit) {
      query += " LIMIT ?"
      params.push(parseInt(req.query.limit))
    }

    const [voitures] = await db.query(query, params)
    res.status(200).json(voitures)

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// GET /api/voitures/:id — Une voiture par ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM voitures WHERE id = ?", [req.params.id])

    if (rows.length === 0) {
      return res.status(404).json({ message: "Voiture non trouvée" })
    }

    res.status(200).json(rows[0])

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Erreur serveur" })
  }
})

// POST /api/voitures
router.post("/", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Ola" });
});

// PUT /api/voitures/:id
router.put("/:id", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Ola" });
});

// DELETE /api/voitures/:id
router.delete("/:id", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Ola" });
});

module.exports = router;