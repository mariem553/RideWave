// Import des modules nécessaires pour le serveur
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Configuration des middlewares pour gérer les requêtes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis le dossier public
app.use(express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));

// Import des routes de l'application
const userRoutes = require("./routes/userRoutes");
const voitureRoutes = require("./routes/voitureRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Montage des routes API
app.use("/api/users", userRoutes);
app.use("/api/voitures", voitureRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);

// Route de test pour vérifier le statut de l'API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "RideWave API running ✅" });
});

const db = require("./config/db");
// Route pour vérifier la connexion à la base de données
app.get("/api/health/db", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({
      ok: true,
      database: process.env.DB_NAME || "non défini",
    });
  } catch (err) {
    res.status(503).json({
      ok: false,
      message: "Connexion MySQL impossible — vérifiez .env et que MySQL tourne.",
      error: err.message,
    });
  }
});

// Pages admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views","login.html"));
});
app.get("/admin/:page", (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, "views", "admin", page));
});

// Page accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Page voiture
app.get("/voiture", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "voiture.html"));
});

// Page login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Page register
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚗 RideWave server running on http://localhost:${PORT}`);
});
