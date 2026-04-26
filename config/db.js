// db.js — configuration du pool MySQL
// Ce fichier lit les variables d'environnement et crée un pool de connexions
// avec support des promesses pour être réutilisé dans toute l'application.
const mysql = require("mysql2");
require("dotenv").config();

// Création du pool de connexions pour gérer les requêtes
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export du pool avec support des promesses
module.exports = pool.promise();

// Ce fichier configure la connexion MySQL et exporte un pool promesse utilisable dans tout le projet.

