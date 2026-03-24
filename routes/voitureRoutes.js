const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Ola" });
});
router.get("/:id", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Ola" });
});
router.post("/", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Ola" });
});
router.put("/:id", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Ola" });
});
router.delete("/:id", async (req, res) => {
  res.status(501).json({ message: "À implémenter — Ola" });
});

module.exports = router;
