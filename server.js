const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
app.use(express.static(path.join(__dirname, "public")));
app.use("/views", express.static(path.join(__dirname, "views")));

// Routes
const userRoutes = require("./routes/userRoutes");
const voitureRoutes = require("./routes/voitureRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/users", userRoutes);
app.use("/api/voitures", voitureRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);

// Route test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "RideWave API running ✅" });
});

// Pages admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin", "voitures.html"));
});
app.get("/admin/:page", (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, "views", "admin", page));
});

// Page accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚗 RideWave server running on http://localhost:${PORT}`);
});
