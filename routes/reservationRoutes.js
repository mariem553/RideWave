const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Yasmine" });
});
router.get("/mes-reservations", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Yasmine" });
});
router.patch("/:id/annuler", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Yasmine" });
});

module.exports = router;
