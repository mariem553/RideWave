# RideWave
RideWave — Application de Location de Voitures Premium
RideWave est une application web full-stack de location de véhicules haut de gamme, développée avec Node.js/Express en backend et du HTML/CSS/JS vanilla côté frontend, avec une base de données MySQL.
Architecture
Le projet suit une architecture MVC classique avec Express comme serveur, une base MySQL pour la persistance, et des pages HTML statiques servies directement. L'authentification repose sur des JWT stockés dans le localStorage.
Fonctionnalités principales
Côté client (utilisateurs) — Une page d'accueil soignée avec flip cards 3D pour présenter la flotte, un formulaire de recherche avec filtres (type, dates, lieu) qui redirige vers la page catalogue. Cette page catalogue offre filtrage multi-critères (marque, catégorie, carburant, prix max, disponibilité), tri, pagination et recherche textuelle en temps réel. Un flux de réservation complet permet de choisir un véhicule, remplir ses informations personnelles, sélectionner les dates et options (chauffeur privé à +30 TND/jour), avec calcul automatique du total. Le profil utilisateur affiche l'historique des réservations avec possibilité d'annulation.
Côté admin — Un dashboard avec KPIs animés (total voitures, disponibilités, réservations confirmées/annulées) et tableau des dernières activités. La gestion de la flotte permet d'ajouter, modifier et supprimer des véhicules avec tous leurs attributs (specs techniques, description marketing, photo). La gestion des réservations offre recherche, filtrage par statut et dates, pagination, et annulation avec confirmation.
Stack technique
Le backend expose des routes REST : /api/users pour l'authentification, /api/voitures pour la flotte publique, /api/reservations pour les réservations client, et /api/admin pour les opérations admin protégées par middleware verifyAdmin. La base de données contient trois tables — users, voitures, reservations — avec contraintes de clés étrangères.
Design
L'interface adopte une esthétique dark luxury avec une palette dorée (#c9a962) sur fond très sombre, typographie mixant Cormorant Garamond (serif) pour les titres et DM Sans pour le corps, animations subtiles (shimmer, reveal au scroll, transitions CSS), et un curseur personnalisé sur la home.
