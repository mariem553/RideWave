const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques - mount at root
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
<<<<<<< HEAD
  res.sendFile(path.join(__dirname, "views", "admin"));
=======
  res.sendFile(path.join(__dirname, "views","login.html"));
>>>>>>> 861e3ae4cfadc55a9b47f9a343d8573f8bc98a28
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
