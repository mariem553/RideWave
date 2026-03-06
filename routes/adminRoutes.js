const express = require("express");
const router = express.Router();

router.get("/stats", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Emen" });
});
router.get("/reservations", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Emen" });
});

module.exports = router;
