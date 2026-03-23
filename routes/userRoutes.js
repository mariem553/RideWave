const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Oumayma" });
});

router.post("/login", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Oumayma" });
});

module.exports = router;
