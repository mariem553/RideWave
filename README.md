🚗 RideWave — Application de Location de Voitures Premium

RideWave est une application web full-stack de location de véhicules haut de gamme.
Elle permet aux utilisateurs de rechercher, réserver et gérer des voitures de luxe, tandis qu’un espace administrateur assure la gestion complète de la flotte et des réservations.

🏗️ Architecture

Le projet suit une architecture MVC classique :

Backend : Node.js + Express
Frontend : HTML / CSS / JavaScript vanilla
Base de données : MySQL
Authentification : JWT stockés dans le localStorage

Le serveur Express expose des API REST et sert des pages HTML statiques.

✨ Fonctionnalités
👤 Côté utilisateur
🏠 Page d’accueil moderne avec flip cards 3D présentant la flotte
🔎 Formulaire de recherche avec filtres (type, dates, lieu)
🚗 Catalogue de véhicules avec :
filtres multi-critères (marque, catégorie, carburant, prix, disponibilité)
tri dynamique
pagination
recherche en temps réel
📅 Système de réservation complet :
sélection de véhicule
choix des dates
options (ex : chauffeur privé +30 TND/jour)
calcul automatique du prix total
👤 Profil utilisateur :
historique des réservations
annulation de réservation
🛠️ Côté administrateur
📊 Dashboard avec KPIs animés :
total voitures
voitures disponibles
réservations confirmées / annulées
📋 Gestion des véhicules :
ajout
modification
suppression
📦 Gestion des réservations :
filtrage par statut et dates
recherche
pagination
annulation avec confirmation
🔧 Stack technique
Backend
Node.js
Express.js
REST API
Frontend
HTML5
CSS3
JavaScript (vanilla)
Base de données
MySQL
Tables :
users
voitures
reservations
🔌 API Endpoints
/api/users → authentification & gestion utilisateurs
/api/voitures → gestion de la flotte
/api/reservations → gestion des réservations
/api/admin → opérations administrateur (protégées par middleware verifyAdmin)
🎨 Design & UI
Style dark luxury
Palette principale : #c9a962 (doré) sur fond sombre
Typographies :
Cormorant Garamond (titres)
DM Sans (texte)
Animations :
shimmer effect
reveal au scroll
transitions CSS fluides
Curseur personnalisé sur la page d’accueil
🚀 Objectif du projet

Offrir une expérience fluide et premium de location de voitures, combinant une interface moderne et une gestion robuste côté backend.
