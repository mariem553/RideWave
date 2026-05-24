/* ===============================================================
   userRoutes.js — routes API utilisateurs
   Description :
   - POST /api/users/register : création de compte client
   - POST /api/users/login : authentification et création de JWT
   - vérifie l'unicité de l'e-mail et génère le token avec role
   =============================================================== */

// Import des modules nécessaires
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const jwt     = require('jsonwebtoken');

/* ===============================================================
   POST /api/users/register — Inscription (role client par defaut)
   =============================================================== */
// Route pour l'inscription d'un nouvel utilisateur
router.post('/register', async (req, res) => {
    const { nom, email, password } = req.body;

    /* Validation */
    if (!nom || !email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    try {
        /* Verifier si email deja utilise */
        const [existing] = await db.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }

        /* Inserer le nouvel utilisateur */
        const [result] = await db.query(
            'INSERT INTO users (nom, email, password, role) VALUES (?, ?, ?, ?)',
            [nom, email, password, 'client']
        );

        /* Creer le JWT */
        const token = jwt.sign(
            { id: result.insertId, email, role: 'client' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            token,
            user: {
                id:    result.insertId,
                nom,
                email,
                role:  'client'
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Erreur serveur.',
            error:   err.message
        });
    }
});

/* ===============================================================
   POST /api/users/login — Connexion (client ET admin — meme route)
   =============================================================== */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    /* Validation */
    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    try {
        /* Chercher l'utilisateur */
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Utilisateur non trouvé.' });
        }

        const user = rows[0];

        /* Verifier le mot de passe (texte clair) */
        if (user.password !== password) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        /* Creer le JWT avec role */
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            token,
            user: {
                id:    user.id,
                nom:   user.nom,
                email: user.email,
                role:  user.role
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Erreur serveur.',
            error:   err.message
        });
    }
});

module.exports = router;

// Routes d'authentification et d'inscription des utilisateurs.
