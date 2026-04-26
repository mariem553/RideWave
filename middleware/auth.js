// auth.js — middleware d'authentification JWT
// Vérifie le token JWT envoyé dans Authorization et expose l'utilisateur
// pour les routes protégées. Fournit également une vérification des droits admin.
const jwt = require("jsonwebtoken");

// Fonction pour vérifier la validité du token JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token requis" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
}

// Fonction pour vérifier les droits d'administrateur
function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès admin requis" });
    }
    next();
  });
}

// Export des fonctions middleware
module.exports = { verifyToken, verifyAdmin };

// Ce middleware vérifie les JWT et applique le contrôle d'accès administrateur.
