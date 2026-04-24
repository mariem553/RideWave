// Configuration de la connexion à la base de données MySQL
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
